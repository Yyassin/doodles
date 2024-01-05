import { createPeer, handleNegotiationNeededEvent } from '@/lib/webrtc';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import axios from 'axios';
import { RefObject, useEffect, useRef } from 'react';

const pollOngoingStream = async (roomID: string, initConsumer: () => void) => {
  try {
    const { data } = await axios.put(`http://localhost:3005/sfu/poll`, {
      roomId: roomID,
    });
    data.roomHasProducer && initConsumer();
  } catch (e) {
    console.error('Failed to poll for ongoing stream');
  }
};

const useRTCConsumer = (
  videoRef: RefObject<HTMLVideoElement | undefined>,
  screenStream: MediaStream | null,
  setScreenStream: (stream: MediaStream | null) => void,
) => {
  const peerRef = useRef<RTCPeerConnection>();
  const { socket, roomID, userId } = useWebSocketStore([
    'socket',
    'roomID',
    'userId',
  ]);

  useEffect(() => {
    // Check if there is an ongoing stream on join, if so
    // init consumer
    return () => {
      cleanup();
      // Leave room for component unmount is handled by canvas
    };
  }, []);
  useEffect(() => {
    // Give a second for socket to connect
    roomID && setTimeout(() => pollOngoingStream(roomID, initConsumer), 1000);
  }, [roomID]);

  useEffect(() => {
    window.onbeforeunload = async () => {
      cleanup();
      await socket?.leaveRoom();
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, [socket]);

  useEffect(() => {
    socket?.on('webrtc-new-streamer', initConsumer);
    socket?.on('webrtc-disconnect-streamer', cleanup);
  }, [roomID, socket, userId]);

  const cleanup = () => {
    peerRef.current?.close();
    peerRef.current = undefined;
    setScreenStream(null);
  };

  const initConsumer = () => {
    const peer = createConsumer();
    if (peer === undefined) {
      console.error('Failed to join stream.');
      return;
    }
    peerRef.current = peer;
    peer.ontrack = (e) => setScreenStream(e.streams[0]);
    peer.addTransceiver('video', { direction: 'recvonly' });
  };

  const createConsumer = () => {
    if (roomID === null) {
      console.error('Cannot start a stream outside a room!');
      return;
    }
    return createPeer(
      (candidate) => {
        socket?.iceCandidate(candidate);
      },
      (peer) =>
        handleNegotiationNeededEvent(
          peer,
          'subscribe',
          roomID,
          userId,
          cleanup,
        ),
    );
  };

  return peerRef;
};

export default useRTCConsumer;
