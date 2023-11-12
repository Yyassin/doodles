import WebsocketClient from '@/WebsocketClient';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { useEffect, useRef } from 'react';

/**
 * Defines a hook that controls all socket related activities
 * @author Abdalla Abdelhadi
 */

export const useSocket = () => {
  const { roomID, actionElementID, action } = useWebSocketStore([
    'roomID',
    'actionElementID',
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
    addCanvasShape: (element: CanvasElement) => {
      const newElement = createElement(
        element.id,
        element.p1.x,
        element.p1.y,
        element.p2.x,
        element.p2.y,
        element.type,
        undefined,
        {
          stroke: element.strokeColor,
          fill: element.fillColor,
          bowing: element.bowing,
          roughness: element.roughness,
          strokeWidth: element.strokeWidth,
          fillStyle: element.fillStyle,
          strokeLineDash: element.strokeLineDash,
          opacity: element.opacity,
        },
      );
      addCanvasShape(newElement);
    },
    addCanvasFreehand: (element: CanvasElement) => {
      const newElement = createElement(
        element.id,
        element.p1.x,
        element.p1.y,
        element.p2.x,
        element.p2.y,
        element.type,
        element.freehandPoints,
        {
          stroke: element.strokeColor,
          fill: element.fillColor,
          bowing: element.bowing,
          roughness: element.roughness,
          strokeWidth: element.strokeWidth,
          fillStyle: element.fillStyle,
          strokeLineDash: element.strokeLineDash,
          opacity: element.opacity,
        },
        true,
      );
      addCanvasFreehand(newElement);
    },
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
    if (actionElementID === '') return;

    //Create element to send to other sockets in room
    const element = createElement(
      actionElementID,
      p1[actionElementID].x,
      p1[actionElementID].y,
      p2[actionElementID].x,
      p2[actionElementID].y,
      types[actionElementID],
      action === 'addCanvasFreehand'
        ? freehandPoints[actionElementID]
        : undefined,
      {
        stroke: strokeColors[actionElementID],
        fill: fillColors[actionElementID],
        bowing: bowings[actionElementID],
        roughness: roughnesses[actionElementID],
        strokeWidth: strokeWidths[actionElementID],
        fillStyle: fillStyles[actionElementID],
        strokeLineDash: strokeLineDashes[actionElementID],
        opacity: opacities[actionElementID],
      },
      true,
    );

    delete element.roughElement;

    socket.current?.sendMsgRoom(action, element);
  }, [actionElementID]);
};
