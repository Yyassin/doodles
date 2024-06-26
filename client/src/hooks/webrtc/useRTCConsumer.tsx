import { SECONDS_TO_MS, WS_TOPICS } from '@/constants';
import { createPeer, handleNegotiationNeededEvent } from '@/lib/webrtc';
import { useAuthStore } from '@/stores/AuthStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { useEffect, useRef } from 'react';
import { sfu } from '@/api';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';

/**
 * Hook that handles creating a consumer if a stream is initiated inside a room.
 * @author Yousef Yassin
 */

/**
 * Hook for managing the WebRTC consumer logic.
 * @param setScreenStream Function, callback to set the screen sharing stream.
 * @returns RefObject, reference to the RTCPeerConnection for the consumer.
 */
const useRTCConsumer = (
  setScreenStream: (stream: MediaStream | null) => void,
) => {
  const peerRef = useRef<RTCPeerConnection>();
  const { socket, roomID, setActiveProducerId } = useWebSocketStore([
    'socket',
    'roomID',
    'setActiveProducerId',
  ]);
  const { userEmail: userId } = useAuthStore(['userEmail']);
  const { boardMeta } = useCanvasBoardStore(['boardMeta']);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      cleanup();
      // Leave room for component unmount is handled by canvas
    };
  }, []);

  useEffect(() => {
    // On mount, check if there's a stream in the room. If so, initiate a consumer connection.
    // Give a second for socket to connect
    roomID &&
      setTimeout(
        () =>
          sfu.poll(roomID, (producerId) => {
            initConsumer();
            setActiveProducerId(producerId);
          }),
        1 * SECONDS_TO_MS,
      );
  }, [roomID]);

  // Cleanup on page refresh, close, or tab close
  useEffect(() => {
    window.onbeforeunload = async () => {
      cleanup();
      await socket?.leaveRoom();
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, [socket]);

  // Socket hooks; if a new streamer joins, create a consumer
  // and if a streamer leaves, cleanup the consumer.
  useEffect(() => {
    socket?.on(WS_TOPICS.RTC_NEW_PRODUCER, initConsumer);
    socket?.on(WS_TOPICS.RTC_DISCONNECT_PRODUCER, cleanup);
  }, [roomID, socket, userId]);

  /**
   * Clean up resources when the component unmounts or the room changes.
   */
  const cleanup = () => {
    peerRef.current?.close();
    peerRef.current = undefined;
    setScreenStream(null);
  };

  /**
   * Initialize the consumer by creating a new RTCPeerConnection and setting up event handlers.
   */
  const initConsumer = () => {
    const peer = createConsumer();
    if (peer === undefined) {
      console.error('Failed to join stream.');
      return;
    }
    peerRef.current = peer;
    // On incoming stream, set the video element's srcObject to the stream.
    peer.ontrack = (e) => {
      setScreenStream(e.streams[0]);
    };
    // Only listen for video tracks
    peer.addTransceiver('video', { direction: 'recvonly' });
  };

  /**
   * Create a new consumer RTCPeerConnection with the necessary callbacks for ICE candidates and negotiation.
   */
  const createConsumer = () => {
    if (roomID === null) {
      console.error('Cannot start a stream outside a room!');
      return;
    }
    return createPeer(
      (candidate) => {
        // On gathered ICE candidates, send them to the signalling server.
        socket?.iceCandidate(candidate);
      },
      (peer) =>
        // Handle answering SDP exchange
        handleNegotiationNeededEvent(
          peer,
          'subscribe',
          roomID,
          `${userId}-${boardMeta.collabID}`,
          cleanup,
        ),
    );
  };

  return peerRef;
};

export default useRTCConsumer;
