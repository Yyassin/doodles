import useRTCConsumer from '@/hooks/webrtc/useRTCConsumer';
import useRTCProducer from '@/hooks/webrtc/useRTCProducer';
import { getScaleOffset } from '@/lib/canvasElements/render';
import { useAppStore } from '@/stores/AppStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Defines a background video element that renders the shared screen (from the priducer, or incoming stream for a consumer).
 * @author Yousef Yassin
 */

const getStreamDetails = (stream: MediaStream | null) =>
  (stream?.getVideoTracks()[0].getSettings() ?? {
    aspectRatio: 1,
  }) as { aspectRatio: number; height: 1; width: 1 };

const ShareScreen = () => {
  /** Reference for the video element */
  const videoRef = useRef<HTMLVideoElement>(null);
  /** State for the screen sharing stream */
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  /** Reference to the WS client */
  const { socket } = useWebSocketStore(['socket']);
  const {
    setIsInCall,
    appWidth,
    appHeight,
    setPanOffset,
    setAppZoom,
    zoom,
    panOffset,
  } = useAppStore([
    'setIsInCall',
    'appWidth',
    'appHeight',
    'setPanOffset',
    'setAppZoom',
    'zoom',
    'panOffset',
  ]);
  /** RTCPeer references, for cleanup; the hooks handle the connections. */
  const producerPeerRef = useRTCProducer(screenStream, setScreenStream);
  const consumerPeerRef = useRTCConsumer(setScreenStream);

  const { width: trueVideoWidth, height: trueVideoHeight } = useMemo(
    () => getStreamDetails(screenStream),
    [screenStream],
  );
  const scaleOffset = useMemo(
    () => getScaleOffset(appHeight, appWidth, zoom),
    [appHeight, appWidth, zoom],
  );

  // Subscribe to remote incoming ICE candidates, and add them to the active peer connection.
  // These are necessary to establish a connection reliably.
  useEffect(() => {
    socket?.on('new-ice-candidate', (msg) => {
      const {
        payload: { candidate },
      } = msg as { payload: { candidate: RTCIceCandidate } };
      //console.log('incoming candidate', candidate);
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

  // On stream, set the call state and center the video
  // on the screen.
  useEffect(() => {
    setIsInCall(screenStream !== null);
    if (videoRef.current && screenStream !== null) {
      videoRef.current.srcObject = screenStream;
      const { height: videoHeight, width: videoWidth } =
        getStreamDetails(screenStream);
      const [tx, ty] = [
        (appWidth - videoWidth) / 2,
        (appHeight - videoHeight) / 2,
      ];
      setPanOffset(tx, ty);
      setAppZoom(1);
    }
  }, [screenStream, videoRef.current]);

  // The video element with a wrapper to clip overflow. We use CSS transformation
  // to scale and translate the video according to our zoom and pan offsets.
  return (
    screenStream !== null && (
      <div
        // Everything is positioned relative to the top left origin,
        // so we can mimic the canvas element's coordinate system.
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <div
          className="flex flex-row items-center justify-center"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            // Match the canvas's origin
            transformOrigin: 'top left',
            transform: ` translate(${panOffset.x * zoom - scaleOffset.x}px, ${
              panOffset.y * zoom - scaleOffset.y
            }px) scaleX(${zoom}) scaleY(${zoom})`,
            backgroundColor: screenStream !== null ? 'transparent' : 'white',
          }}
        >
          <video
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              // By default, the max is 100%; we can't have the video
              // scaled to the window size otherwise it'll differ for different
              // clients, so we need to have an absolute coordinate system; i.e
              // the original video's size (which is less than 10000x10000)
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
      </div>
    )
  );
};

export default ShareScreen;
