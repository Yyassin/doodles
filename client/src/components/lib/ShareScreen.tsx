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
    videoHeight,
    videoWidth,
  } = useAppStore([
    'setIsInCall',
    'appWidth',
    'appHeight',
    'setPanOffset',
    'setAppZoom',
    'zoom',
    'panOffset',
    'setVideoDimensions',
    'videoHeight',
    'videoWidth',
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
    setIsInCall(screenStream !== null);
    if (videoRef.current && screenStream !== null) {
      videoRef.current.srcObject = screenStream;
      setPanOffset(0, 0);
      setAppZoom(1);
    }
  }, [screenStream, videoRef.current]);
  useEffect(() => {
    if (screenStream === null) return;
    const { aspectRatio: aspect } = screenStream
      ?.getVideoTracks()[0]
      .getSettings() as { aspectRatio: number };
    const videoHeight = appWidth / aspect;
    const videoWidth = appHeight * aspect;
    console.log(videoHeight, videoWidth);
    console.log(appHeight, appWidth);
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
        <div
          style={{
            position: 'absolute',
            maxHeight: appHeight,
            maxWidth: appWidth,
            overflow: 'hidden',
          }}
        >
          <video
            style={{
              transform: `scaleX(${zoom}) scaleY(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
            ref={videoRef}
            width={videoWidth ? videoWidth : appWidth}
            height={videoHeight ? videoHeight : appHeight}
            id="localElement"
            playsInline
            muted
            autoPlay
          />
        </div>
      )}
    </div>
  );
};

export default ShareScreen;
