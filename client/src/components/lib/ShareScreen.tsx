import useRTCConsumer from '@/hooks/webrtc/useRTCConsumer';
import useRTCProducer from '@/hooks/webrtc/useRTCProducer';
import { getScaleOffset } from '@/lib/canvasElements/render';
import { useAppStore } from '@/stores/AppStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import React, { useEffect, useRef, useState } from 'react';

const ShareScreen = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const { socket } = useWebSocketStore(['socket']);

  const {
    setIsInCall,
    appWidth,
    appHeight,
    setPanOffset,
    setAppZoom,
    zoom,
    panOffset,
    setVideoDimensions,
  } = useAppStore([
    'setIsInCall',
    'appWidth',
    'appHeight',
    'setPanOffset',
    'setAppZoom',
    'zoom',
    'panOffset',
    'setVideoDimensions',
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

  const {
    aspectRatio: aspect,
    width: trueVideoWidth,
    height: trueVideoHeight,
  } = (screenStream?.getVideoTracks()[0].getSettings() ?? {
    aspectRatio: 1,
  }) as { aspectRatio: number; height: 1; width: 1 };

  useEffect(() => {
    setIsInCall(screenStream !== null);
    if (videoRef.current && screenStream !== null) {
      videoRef.current.srcObject = screenStream;
      setPanOffset(0, 0);
      setAppZoom(1);
    }
  }, [screenStream, videoRef.current]);
  useEffect(() => {
    if (screenStream === null) return;
    const videoHeight = appWidth / aspect;
    const videoWidth = appHeight * aspect;
    let w, h;
    if (videoHeight < appHeight) {
      h = appHeight;
      w = videoWidth;
    } else {
      w = appWidth;
      h = videoHeight;
    }
    setVideoDimensions(w, h);
  }, [screenStream, appHeight, appWidth]);

  //const scaleOffset = getScaleOffset(appHeight, appWidth, zoom);

  // Temporarily apply scaling
  // Panning & zooming
  return (
    screenStream !== null && (
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
          overflow: 'hidden',
        }}
      >
        <video
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `scaleX(${zoom}) scaleY(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            maxWidth: '10000px',
            maxHeight: '10000px',
          }}
          ref={videoRef}
          width={trueVideoWidth}
          height={trueVideoHeight}
          id="localElement"
          playsInline
          muted
          autoPlay
        />
      </div>
    )
  );
};

export default ShareScreen;
