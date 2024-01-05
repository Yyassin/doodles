import { startScreenShare } from '@/lib/screenshare';
import { createPeer, handleNegotiationNeededEvent } from '@/lib/webrtc';
import { useAppStore } from '@/stores/AppStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { RefObject, useEffect, useRef } from 'react';

const useRTCProducer = (
  videoRef: RefObject<HTMLVideoElement | undefined>,
  screenStream: MediaStream | null,
  setScreenStream: (stream: MediaStream | null) => void,
) => {
  const peerRef = useRef<RTCPeerConnection>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { isSharingScreen, setIsSharingScreen } = useAppStore([
    'isSharingScreen',
    'setIsSharingScreen',
  ]);
  const { socket, roomID, userId } = useWebSocketStore([
    'socket',
    'roomID',
    'userId',
  ]);

  useEffect(() => {
    return () => {
      cleanup();
      // Leave room for component unmount is handled by canvas
    };
  }, []);

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
    if (isSharingScreen) {
      initProducer();
    } else {
      cleanup();
      stopScreenShare();
    }
  }, [isSharingScreen]);

  const initProducer = async () => {
    if (!isSharingScreen) {
      return;
    }
    const { stream, recorder } = await startScreenShare(
      setScreenStream,
      async () => {
        setScreenStream(null);
        setIsSharingScreen(false);
        await socket?.rtcEnd();
        peerRef.current?.close();
        peerRef.current = undefined;
      },
    );
    if (stream === undefined || recorder === undefined) {
      console.log('canceled');
      setIsSharingScreen(false);
      return;
    }
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

  const createProducer = () => {
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
          'broadcast',
          roomID,
          userId,
          cleanup,
        ),
    );
  };

  const cleanup = () => {
    peerRef.current?.close();
    peerRef.current = undefined;
    stopScreenShare();
  };

  const stopScreenShare = () => {
    if (screenStream) {
      const tracks = screenStream.getTracks();
      // Remove from peer stream?
      tracks.forEach((track) => track.stop());
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
    setScreenStream(null);
    setIsSharingScreen(false);
  };

  return peerRef;
};

export default useRTCProducer;
