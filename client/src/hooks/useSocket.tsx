import WebsocketClient from '@/WebsocketClient';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { useEffect, useRef } from 'react';

/**
 * Defines a hook that controls all socket related activities
 * @author Abdalla Abdelhadi
 */

export const useSocket = () => {
  const { roomID, elemID, action } = useWebSocketStore([
    'roomID',
    'elemID',
    'action',
  ]);

  const {
    addCanvasShape,
    addCanvasFreehand,
    types,
    strokeColors,
    fillColors,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    freehandPoints,
    p1,
    p2,
  } = useCanvasElementStore([
    'addCanvasShape',
    'addCanvasFreehand',
    'types',
    'strokeColors',
    'fillColors',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'freehandPoints',
    'p1',
    'p2',
  ]);

  const socket = useRef<WebsocketClient>();

  //setup callBack object based on actions
  const callBacks = {
    addCanvasShape,
    addCanvasFreehand,
  };

  //intialize socket
  useEffect(() => {
    socket.current = new WebsocketClient(callBacks);
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  //The socket joins room or leaves once the roomID changes
  useEffect(() => {
    if (roomID === null) {
      if (socket.current?.room !== null) {
        socket.current?.leaveRoom();
      }
    } else {
      socket.current?.joinRoom(roomID);
    }
  }, [roomID]);

  //Send message once action gets set. Note: will be changed
  useEffect(() => {
    if (elemID === '') return;

    //craete element to send to other sockets in room
    const element = createElement(
      elemID,
      p1[elemID].x,
      p1[elemID].y,
      p2[elemID].x,
      p2[elemID].y,
      types[elemID],
      action === 'addCanvasFreehand' ? freehandPoints[elemID] : undefined,
      {
        stroke: strokeColors[elemID],
        fill: fillColors[elemID],
        bowing: bowings[elemID],
        roughness: roughnesses[elemID],
        strokeWidth: strokeWidths[elemID],
        fillStyle: fillStyles[elemID],
        strokeLineDash: strokeLineDashes[elemID],
        opacity: opacities[elemID],
      },
      true,
    );

    socket.current?.sendMsgRoom(action, element);
  }, [elemID]);
};
