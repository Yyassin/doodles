import { WS_TOPICS } from '@/constants';
import useRTCConsumer from '@/hooks/webrtc/useRTCConsumer';
import useRTCProducer from '@/hooks/webrtc/useRTCProducer';
import { getScaleOffset } from '@/lib/canvasElements/render';
import { useAppStore } from '@/stores/AppStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ScreenSelectDialog from './ScreenSelectDialog';
import { StreamSource } from '@/types';
import { sfu } from '@/api';

/**
 * Defines a background video element that renders the shared screen (from the priducer, or incoming stream for a consumer).
 * @author Yousef Yassin
 */

const ShareScreen = () => {
  /** Reference for the video element */
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trueVideoDimensions, setTrueVideoDimensions] = useState<{
    height: number;
    width: number;
  }>({ height: 0, width: 0 });
  /** State for the screen sharing stream */
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenSelectDialogOpen, setScreenSelectDialogOpen] = useState(false);
  const [streamSources, setStreamSources] = useState<StreamSource[]>([]);
  /** Reference to the WS client */
  const { socket, setActiveProducerId, roomID } = useWebSocketStore([
    'socket',
    'setActiveProducerId',
    'roomID',
  ]);
  const {
    setIsInCall,
    appWidth,
    appHeight,
    setPanOffset,
    setAppZoom,
    zoom,
    panOffset,
    canvasColor,
    isTransparent,
  } = useAppStore([
    'setIsInCall',
    'appWidth',
    'appHeight',
    'setPanOffset',
    'setAppZoom',
    'zoom',
    'panOffset',
    'canvasColor',
    'isTransparent',
  ]);
  /** RTCPeer references, for cleanup; the hooks handle the connections. */
  const { peerRef: producerPeerRef, setSelectedSourceId } = useRTCProducer(
    screenStream,
    setScreenStream,
    setScreenSelectDialogOpen,
    setStreamSources,
  );
  const consumerPeerRef = useRTCConsumer(setScreenStream);

  const scaleOffset = useMemo(
    () => getScaleOffset(appHeight, appWidth, zoom),
    [appHeight, appWidth, zoom],
  );

  // Subscribe to remote incoming ICE candidates, and add them to the active peer connection.
  // These are necessary to establish a connection reliably.
  useEffect(() => {
    socket?.on(WS_TOPICS.ICE_CANDIDATE, (msg) => {
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
      videoRef.current.onresize = (e) => {
        const { videoHeight: height, videoWidth: width } = (e.target ?? {}) as {
          videoWidth: number | undefined;
          videoHeight: number | undefined;
        };
        if (width && height) {
          setTrueVideoDimensions({ width, height });
        }
      };
      videoRef.current.onloadedmetadata = (e) => {
        const { videoHeight: height, videoWidth: width } = (e.target ?? {}) as {
          videoWidth: number | undefined;
          videoHeight: number | undefined;
        };
        if (width && height) {
          setTrueVideoDimensions({ width, height });
        }
      };
    }
  }, [screenStream, videoRef.current]);

  /**
   * Update the active producer id when we receive
   * a new stream (or null if the stream is removed, or
   * the we exit the room).
   */
  useEffect(() => {
    if (roomID && screenStream) {
      sfu.poll(roomID, setActiveProducerId);
    } else {
      setActiveProducerId(null);
    }
  }, [roomID, screenStream]);

  useEffect(() => {
    // We only want to set the offset when the video is loaded; we also don't
    // load our own video in transparency mode so we don't want this to fire (it should
    // be disabled in the store anyway).
    if (videoRef.current !== null) {
      const { width, height } = trueVideoDimensions;
      const [tx, ty] = [(appWidth - width) / 2, (appHeight - height) / 2];
      setPanOffset(tx, ty);
      setAppZoom(1);
    }
  }, [trueVideoDimensions]);

  // The video element with a wrapper to clip overflow. We use CSS transformation
  // to scale and translate the video according to our zoom and pan offsets.
  return (
    <>
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
          zIndex: 0,
          backgroundColor: isTransparent ? 'transparent' : canvasColor,
        }}
      >
        {screenStream !== null && !isTransparent && (
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
              id="localElement"
              playsInline
              muted
              autoPlay
            />
          </div>
        )}
      </div>
      <ScreenSelectDialog
        open={screenSelectDialogOpen}
        setOpen={setScreenSelectDialogOpen}
        streamSources={streamSources}
        onContinue={setSelectedSourceId}
      />
    </>
  );
};

export default ShareScreen;
