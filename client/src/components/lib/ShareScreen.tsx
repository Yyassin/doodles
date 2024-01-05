import useRTCConsumer from '@/hooks/webrtc/useRTCConsumer';
import useRTCProducer from '@/hooks/webrtc/useRTCProducer';
import { getScaleOffset } from '@/lib/canvasElements/render';
import { useAppStore } from '@/stores/AppStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import React, { useEffect, useRef, useState } from 'react';

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
  const consumerPeerRef = useRTCConsumer(
    videoRef,
    screenStream,
    setScreenStream,
  );

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
      } else if (
        consumerPeerRef.current &&
        consumerPeerRef.current.remoteDescription !== null
      ) {
        consumerPeerRef.current.addIceCandidate(candidate as RTCIceCandidate);
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
        backgroundColor: screenStream !== null ? 'transparent' : 'white',
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
