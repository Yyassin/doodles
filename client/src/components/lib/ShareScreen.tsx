import WebsocketClient from '@/WebsocketClient';
import { getScaleOffset } from '@/lib/canvasElements/render';
import { startScreenShare } from '@/lib/screenshare';
import { createPeer, handleNegotiationNeededEvent } from '@/lib/webrtc';
import { useAppStore } from '@/stores/AppStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import React, { RefObject, useEffect, useRef, useState } from 'react';

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
      return;
    }
    const peer = createProducer();
    if (peer === undefined) {
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

const ShareScreen = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>();
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const { socket } = useWebSocketStore(['socket']);
  const { appHeight, appWidth, zoom, panOffset } = useAppStore([
    'appHeight',
    'appWidth',
    'zoom',
    'panOffset',
  ]);
  const producerPeerRef = useRTCProducer(
    videoRef,
    screenStream,
    setScreenStream,
  );
  //useRTCConsumer();

  useEffect(() => {
    socket?.on('new-ice-candidate', (msg) => {
      const {
        payload: { candidate },
      } = msg as { payload: { candidate: RTCIceCandidate } };
      console.log('incoming candidate', candidate);
      if (
        producerPeerRef.current &&
        producerPeerRef.current.remoteDescription !== null
      ) {
        producerPeerRef.current.addIceCandidate(candidate as RTCIceCandidate);
      }
    });
  }, []);

  useEffect(() => {
    if (screenStream !== null) {
      videoRef.current = document.createElement('video');
      videoRef.current.srcObject = screenStream;
      videoRef.current.addEventListener('loadeddata', loadedDataHandler);
      updateCanvas();
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', loadedDataHandler);
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current = undefined;
      }
    };
  }, [screenStream]);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.removeEventListener('loadeddata', loadedDataHandler);
      videoRef.current.addEventListener('loadeddata', loadedDataHandler);
      updateCanvas();
    }
  }, [appWidth, appHeight, zoom, panOffset]);
  const loadedDataHandler = () => {
    videoRef.current && videoRef.current.play();
    updateCanvas();
  };
  const updateCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && videoRef.current) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const { videoHeight: height, videoWidth: width } = videoRef.current;
      const aspect = height / width;
      const videoHeight = appWidth * aspect;
      const scaleOffset = getScaleOffset(appHeight, appWidth, zoom);
      // Clear on each rerender
      canvas && ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(
        panOffset.x * zoom - scaleOffset.x,
        panOffset.y * zoom - scaleOffset.y,
      );
      ctx.scale(zoom, zoom);
      ctx.drawImage(
        videoRef.current,
        0,
        (appHeight - videoHeight) / 2,
        appWidth,
        videoHeight,
      );
      ctx.restore();
    }
    requestAnimationFrame(updateCanvas);
  };

  return (
    <div
      className="flex flex-row items-center justify-center"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        // If share, set to transparent?
        backgroundColor: 'transparent',
        zIndex: -1,
      }}
    >
      {screenStream !== null && (
        <canvas width={appWidth} height={appHeight} ref={canvasRef} />
      )}
    </div>
  );
};

export default ShareScreen;
