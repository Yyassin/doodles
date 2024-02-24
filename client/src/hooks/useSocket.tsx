import WebsocketClient from '@/WebsocketClient';
import { UpdatedTimeMessage, useWebSocketStore } from '@/stores/WebSocketStore';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/AuthStore';
import { fileCache } from '@/lib/cache';
import { dataURLToFile } from '@/lib/bytes';
import { commitImageToCache, isSupportedImageFile } from '@/lib/image';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { Vector2 } from '@/types';

/**
 * Defines a hook that controls all socket related activities
 * @author Abdalla Abdelhadi
 */

export const useSocket = () => {
  const { userEmail: userId } = useAuthStore(['userEmail']);
  const {
    roomID,
    actionElementID,
    action,
    setSocket,
    setWebsocketAction,
    setCursorPosition,
  } = useWebSocketStore([
    'roomID',
    'actionElementID',
    'action',
    'setSocket',
    'setWebsocketAction',
    'setCursorPosition',
  ]);

  const {
    addCanvasShape,
    addCanvasFreehand,
    editCanvasElement,
    undoCanvasHistory,
    redoCanvasHistory,
    pushCanvasHistory,
    removeCanvasElements,
    setSelectedElements,
    types,
    strokeColors,
    fillColors,
    fontFamilies,
    fontSizes,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    freehandPoints,
    angles,
    p1,
    p2,
    textStrings,
    fileIds,
  } = useCanvasElementStore([
    'addCanvasShape',
    'addCanvasFreehand',
    'editCanvasElement',
    'undoCanvasHistory',
    'redoCanvasHistory',
    'pushCanvasHistory',
    'removeCanvasElements',
    'setSelectedElements',
    'types',
    'strokeColors',
    'fillColors',
    'fontFamilies',
    'fontSizes',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'freehandPoints',
    'angles',
    'p1',
    'p2',
    'textStrings',
    'fileIds',
  ]);

  const { boardMeta, setBoardMeta, updateCanvas } = useCanvasBoardStore([
    'boardMeta',
    'setBoardMeta',
    'updateCanvas',
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
          font: element.fontFamily,
          size: element.fontSize,
          bowing: element.bowing,
          roughness: element.roughness,
          strokeWidth: element.strokeWidth,
          fillStyle: element.fillStyle,
          strokeLineDash: element.strokeLineDash,
          opacity: element.opacity,
          text: element.text,
          angle: element.angle,
        },
      );

      if (element.type === 'image' && element.imgDataURL) {
        // Add the file to the cache, and set the image as placed
        newElement.isImagePlaced = true;
        const imageFile = dataURLToFile(element.imgDataURL);
        if (!isSupportedImageFile(imageFile)) {
          throw new Error('Unsupported image type.');
        }
        addCanvasShape(newElement);
        commitImageToCache(
          {
            mimeType: imageFile.type,
            id: element.id,
            dataURL: element.imgDataURL,
            created: Date.now(),
            lastRetrieved: Date.now(),
          },
          newElement,
          editCanvasElement,
          false,
        ).then(pushCanvasHistory);
      } else {
        addCanvasShape(newElement);
        pushCanvasHistory();
      }
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
          font: element.fontFamily,
          size: element.fontSize,
          bowing: element.bowing,
          roughness: element.roughness,
          strokeWidth: element.strokeWidth,
          fillStyle: element.fillStyle,
          strokeLineDash: element.strokeLineDash,
          opacity: element.opacity,
          text: element.text,
          angle: element.angle,
        },
        true,
      );

      addCanvasFreehand(newElement);
      pushCanvasHistory();
    },
    editCanvasElement: (element: CanvasElement) => {
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
          text: element.text,
          font: element.fontFamily,
          size: element.fontSize,
          angle: element.angle,
        },
        true,
      );
      editCanvasElement(element.id, newElement, true);
      pushCanvasHistory();
    },
    removeCanvasElements: (ids: string[]) => {
      setSelectedElements([]);
      removeCanvasElements(ids);
      pushCanvasHistory();
    },
    undoCanvasHistory: () => {
      undoCanvasHistory();
    },
    redoCanvasHistory: () => {
      redoCanvasHistory();
    },
    updateUpdatedTime: (fields: UpdatedTimeMessage) => {
      setBoardMeta({ lastModified: fields.lastModified });
      updateCanvas(fields.boardID, fields.lastModified);
    },
    updateCursorPosition: (cursorPosition: Vector2 & { userId: string }) =>
      setCursorPosition(cursorPosition.userId, {
        x: cursorPosition.x,
        y: cursorPosition.y,
      }),
  };

  // Intialize socket
  useEffect(() => {
    if (!userId) {
      return;
    }
    socket.current = new WebsocketClient(callBacks, userId);
    setSocket(socket.current);
    return () => {
      if (socket.current?.room !== null) {
        socket.current?.leaveRoom();
      }
      socket.current?.disconnect();
    };
  }, [userId]);

  // The socket joins room or leaves once the roomID changes
  useEffect(() => {
    if (roomID === null) {
      if (socket.current?.room !== null) {
        socket.current?.leaveRoom();
      }
    } else {
      socket.current?.joinRoom(roomID, boardMeta.collabID);
    }
  }, [roomID]);

  const processWebsocketAction = async (id: string) => {
    //Create element to send to other sockets in room
    const element = createElement(
      id,
      p1[id].x,
      p1[id].y,
      p2[id].x,
      p2[id].y,
      types[id],
      freehandPoints[id],
      {
        stroke: strokeColors[id],
        fill: fillColors[id],
        font: fontFamilies[id],
        size: fontSizes[id],
        bowing: bowings[id],
        roughness: roughnesses[id],
        strokeWidth: strokeWidths[id],
        fillStyle: fillStyles[id],
        strokeLineDash: strokeLineDashes[id],
        opacity: opacities[id],
        text: textStrings[id],
        angle: angles[id],
      },
      true,
    );

    if (element.type === 'image') {
      const imageFileId = fileIds[id];
      const imageFile = fileCache.cache[imageFileId ?? ''];
      if (imageFileId === undefined || imageFile === undefined) {
        throw new Error('Image file not found for transmision');
      }
      const imgDataURL = imageFile.dataURL;
      element.imgDataURL = imgDataURL;
    }

    delete element.roughElement;
    socket.current?.sendMsgRoom(action, element);
    setWebsocketAction('', '');
  };

  // Send message once action gets set.
  useEffect(() => {
    if (actionElementID === '') return;

    if (action === 'undoCanvasHistory' || action === 'redoCanvasHistory') {
      socket.current?.sendMsgRoom(action, null);
      setWebsocketAction('', '');
      return;
    }

    //Check if the actionElementID is string[] (collection of ids)
    if (typeof actionElementID === 'object' || action === 'addCollab') {
      socket.current?.sendMsgRoom(action, actionElementID);
      setWebsocketAction('', '');
      return;
    }
    processWebsocketAction(actionElementID);
  }, [
    actionElementID,
    action,
    p1,
    p2,
    types,
    freehandPoints,
    strokeColors,
    fillColors,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    textStrings,
  ]);
};
