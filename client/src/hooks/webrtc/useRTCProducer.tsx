import { startScreenShare } from '@/lib/screenshare';
import { createPeer, handleNegotiationNeededEvent } from '@/lib/webrtc';
import { useAppStore } from '@/stores/AppStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { StreamSource } from '@/types';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook that handles creating a producer if a stream is started inside a room.
 * @author Yousef Yassin
 */

/**
 * Hook that manages the WebRTC producer logic for sharing screen streams.
 * @param setScreenStream Function, callback to set the screen sharing stream.
 * @returns RefObject, reference to the RTCPeerConnection for the producer.
 */
const useRTCProducer = (
  screenStream: MediaStream | null,
  setScreenStream: (stream: MediaStream | null) => void,
  setScreenSelectDialogOpen: (value: boolean) => void,
  setStreamSources: (streamSources: StreamSource[]) => void,
) => {
  const peerRef = useRef<RTCPeerConnection>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { isSharingScreen, setIsSharingScreen } = useAppStore([
    'isSharingScreen',
    'setIsSharingScreen',
  ]);
  const { socket, roomID } = useWebSocketStore(['socket', 'roomID']);
  const { userEmail: userId } = useAuthStore(['userEmail']);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      cleanup();
      // Leave room for component unmount is handled by canvas
    };
  }, []);

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

  // Start, cleanup stream on isSharingScreen change.
  useEffect(() => {
    if (isSharingScreen) {
      initProducer();
    } else {
      // Recorder on stop will handle cleanup
      stopScreenShare();
      cleanup();
    }
  }, [isSharingScreen]);
  useEffect(() => {
    if (selectedSourceId !== null) {
      setStreamFromId(selectedSourceId);
    }
  }, [selectedSourceId]);

  /**
   * Initializes a screenshare recorder, and producer for sharing screen streams.
   */
  const initProducer = async () => {
    // If we're using electron then we set the sharing screen
    // state after already initializing the producer, in which
    // case there will be a selected source id.
    if (!isSharingScreen || selectedSourceId !== null) {
      return;
    }
    // Start the screenshare.
    const { stream, recorder } = ((await startScreenShare(
      setScreenStream,
      async () => {
        setScreenStream(null);
        setIsSharingScreen(false);
        cleanup();
      },
      (streamSources) => {
        setScreenSelectDialogOpen(true);
        setStreamSources(streamSources);
      },
    )) ?? {}) as unknown as { stream: MediaStream; recorder: MediaRecorder };
    if (stream === undefined || recorder === undefined) {
      console.log('pending or cancelled');
      setIsSharingScreen(false);
      return;
    }
    // Create the producer peer.
    const peer = createProducer();
    if (peer === undefined) {
      setIsSharingScreen(false);
      return;
    }

    peerRef.current = peer;
    mediaRecorderRef.current = recorder;
    // TODO: Store senders with labels in ref
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
  };

  /**
   * Initialize the producer by creating a new RTCPeerConnection and setting up event handlers.
   */
  const createProducer = () => {
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
          'broadcast',
          roomID,
          userId,
          cleanup,
        ),
    );
  };

  /**
   * Clean up resources when the component unmounts or the room changes.
   */
  const cleanup = async () => {
    if (peerRef.current !== undefined) {
      await socket?.rtcEnd();
      peerRef.current?.close();
      peerRef.current = undefined;
      stopScreenShare();
      setSelectedSourceId(null);
    }
  };

  /**
   * In Electron, the streamId will be set by the alert dialog.
   * On set, we can fetch the media stream from the desktop capture API
   * using getDisplayMedia and start the stream this way.
   * @param streamId The Id of the stream to fetch.
   */
  const setStreamFromId = async (streamId: string) => {
    // Overriden by electron in renderer.js
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia(streamId);
    setScreenStream(stream);
    // Create the producer peer.
    const peer = createProducer();
    if (peer === undefined) {
      setIsSharingScreen(false);
      return;
    }

    peerRef.current = peer;
    // TODO: Store senders with labels in ref
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    setIsSharingScreen(true);
  };

  /**
   * End the screensharing.
   */
  const stopScreenShare = () => {
    // Remove all tracks from the stream.
    if (screenStream) {
      const tracks = screenStream.getTracks();
      // Remove from peer stream?
      tracks.forEach((track) => track.stop());
    }
    // Cleanup recorder, this removes the window pop up.
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
    setScreenStream(null);
    setIsSharingScreen(false);
  };

  return { peerRef, setSelectedSourceId };
};

export default useRTCProducer;
