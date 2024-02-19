import React, { MouseEvent, useEffect, useRef, FocusEvent } from 'react';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { FileIcon } from '@radix-ui/react-icons';
import {
  adjustElementCoordinatesById,
  rescalePointsInElem,
  resizedCoordinates,
} from '@/lib/canvasElements/resize';
import {
  cursorForPosition,
  getElementAtPosition,
} from '@/lib/canvasElements/selection';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import {
  CanvasElementType,
  TransformHandleDirection,
  Vector2,
  fontSizeOffsets,
} from '@/types';
import { User, useWebSocketStore } from '@/stores/WebSocketStore';
import { getScaleOffset } from '@/lib/canvasElements/render';
import {
  IS_ELECTRON_INSTANCE,
  PERIPHERAL_CODES,
  SECONDS_TO_MS,
  WS_TOPICS,
} from '@/constants';
import {
  extractUsername,
  getCanvasContext,
  isDrawingTool,
  setCursor,
} from '@/lib/misc';
import { imageCache } from '../../lib/cache';
import { generateRandId } from '@/lib/bytes';
import { normalizeAngle } from '@/lib/math';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { tenancy } from '@/api';
import { useAuthStore } from '@/stores/AuthStore';

/**
 * Main Canvas View
 * @authors Yousef Yassin, Dana El Sherif
 */

export default function Canvas() {
  const {
    action,
    tool,
    appHeight,
    appWidth,
    zoom,
    panOffset,
    setPanOffset,
    setAction,
  } = useAppStore([
    'action',
    'tool',
    'appHeight',
    'appWidth',
    'zoom',
    'panOffset',
    'setPanOffset',
    'setAction',
    'isTransparent',
  ]);
  const {
    addCanvasShape,
    addCanvasFreehand,
    editCanvasElement,
    p1,
    p2,
    types,
    allIds,
    selectedElementIds,
    freehandPoints,
    pushCanvasHistory,
    setSelectedElements,
    setSelectionFrame,
    setPendingImageElement,
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
    textStrings,
    pendingImageElementId,
    fileIds,
    angles,
    isSelectionFrameSet,
    toolOptions,
    attachedFileUrls,
  } = useCanvasElementStore([
    'addCanvasShape',
    'addCanvasFreehand',
    'editCanvasElement',
    'p1',
    'p2',
    'types',
    'allIds',
    'setSelectedElements',
    'setSelectionFrame',
    'freehandPoints',
    'selectedElementIds',
    'pushCanvasHistory',
    'setSelectedElements',
    'setPendingImageElement',
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
    'textStrings',
    'pendingImageElementId',
    'fileIds',
    'angles',
    'isSelectionFrameSet',
    'toolOptions',
    'attachedFileUrls',
  ]);

  const { socket, setWebsocketAction, setRoomID, setTenants, clearTenants } =
    useWebSocketStore([
      'socket',
      'setWebsocketAction',
      'setRoomID',
      'setTenants',
      'clearTenants',
    ]);
  const { boardMeta } = useCanvasBoardStore(['boardMeta']);
  const { userEmail } = useAuthStore(['userEmail']);

  // Id of the element currently being drawn.
  const selectOffset = useRef<Vector2 | null>(null);
  // Id of the element being drawn (for the first time).
  const currentDrawingElemId = useRef('');
  const panMouseStartPosition = useRef({ x: 0, y: 0 } as Vector2);
  // Position of the transform handle last used.
  const selectedHandlePositionRef = useRef<TransformHandleDirection | null>(
    null,
  );
  // Text area input for text elements
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Callbacks for active tenants in the room.
   */
  useEffect(() => {
    socket?.on(WS_TOPICS.NOTIFY_JOIN_ROOM, initTenants);
    socket?.on(WS_TOPICS.NOTIFY_LEAVE_ROOM, initTenants);
    return clearTenants;
  }, [socket]);

  /**
   * Called everytime someone joins or leaves the room, and once we initially join, to maintain
   * the list of active tenants. Note that
   * we fetch rather than update locally to ensure
   * consistency.
   */
  const initTenants = async () => {
    const tenantIds = (await tenancy.get(boardMeta.roomID)) as string[];
    const activeTenants = tenantIds.reduce(
      (acc, id) => {
        // We don't want to add ourselves to the list of tenants.
        id !== userEmail &&
          (acc[id] = {
            // Temp
            username: extractUsername(id) ?? id,
            email: id,
            initials: 'A',
            avatar: 'https://github.com/shadcn.png',
            outlineColor: `#${Math.floor(Math.random() * 16777215).toString(
              16,
            )}`,
          });
        return acc;
      },
      {} as Record<string, User>,
    );
    setTenants(activeTenants);
  };

  // Remove room ID on unmount.
  useEffect(() => {
    setRoomID(boardMeta?.roomID ?? null);
    // Give some time to join the room before
    // fetching the tenants.
    setTimeout(initTenants, 1 * SECONDS_TO_MS);
    return () => setRoomID(null);
  }, [boardMeta, userEmail]);

  // Initializes text-area on text edit.
  useEffect(() => {
    // Auto-focus text-area on writing init, and add existing text, if any.
    if (action === 'writing') {
      // Needs the delay for relinquishing the thread for some reason
      setTimeout(() => {
        if (textAreaRef.current === null) return;
        textAreaRef.current.focus();
        selectedElementIds.length === 1 &&
          (textAreaRef.current.value = textStrings[selectedElementIds[0]]);
      }, 0);
    }
  }, [action, selectedElementIds, textStrings]);

  // True if a drawing tool is selected, false otherwise.
  const isDrawingSelected = isDrawingTool(tool);
  // Offset required to normalized zoomed mouse coordinates.
  const scaleOffset = getScaleOffset(appHeight, appWidth, zoom);

  /**
   * Retrieves normalized mouse coordinates according to the
   * set zoom level.
   * @param e The mouse event containing the raw mouse coordinates.
   * @returns The normalized mouse coordinates.
   */
  const titlebarHeight = IS_ELECTRON_INSTANCE ? 30 : 0;
  const getMouseCoordinates = (e: MouseEvent<HTMLCanvasElement>) => {
    const clientX = (e.clientX - panOffset.x * zoom + scaleOffset.x) / zoom;
    const clientY =
      (e.clientY - titlebarHeight - panOffset.y * zoom + scaleOffset.y) / zoom;
    return { clientX, clientY };
  };

  // Update a canvas element's position state.
  const updateElement = (
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: CanvasElementType,
    options?: {
      points?: Vector2[];
      text?: string;
    },
  ) => {
    const updatedElement = createElement(
      id,
      x1,
      y1,
      x2,
      y2,
      type,
      options?.points,
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
        text: options?.text ?? '',
        angle: angles[id],
      },
    );
    editCanvasElement(id, {
      // If we're updating a curve, p1 and p2 are calculated internally. Otherwise,
      // we set them explicitly when resizing -- and an affine transform is determined
      // compared to the original curve's bounds.
      ...(updatedElement.freehandPoints === undefined && {
        p1: { x: x1, y: y1 },
      }),
      ...(updatedElement.freehandPoints === undefined && {
        p2: { x: x2, y: y2 },
      }),
      roughElement: updatedElement.roughElement,
      freehandPoints: updatedElement.freehandPoints,
      text: updatedElement.text,
    });
  };

  /**
   * Handles committing text updates once the textbox is unfocused.
   */
  const handleTextBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    const elementId = selectedElementIds[0] || currentDrawingElemId.current;
    const { x: x1, y: y1 } = p1[elementId];
    const elementType = types[elementId];

    const text = e?.target?.value;
    const { ctx } = getCanvasContext();
    if (ctx === null) return;

    // Set the element's font style so measuretext
    // calculates the correct width.
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font = ` ${fontSizes[currentDrawingElemId.current]}px ${
      fontFamilies[currentDrawingElemId.current[0]]
    }`;
    const textWidth = ctx.measureText(text).width;
    ctx.restore();

    const textHeight = fontSizes[currentDrawingElemId.current];
    updateElement(
      elementId,
      x1,
      y1,
      x1 + textWidth,
      y1 + textHeight,
      elementType,
      {
        text,
      },
    );

    setWebsocketAction(elementId, 'addCanvasShape');
    pushCanvasHistory();

    // Cleanup
    setAction('none');
    setSelectedElements([]);
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.button === PERIPHERAL_CODES.RIGHT_MOUSE) {
      return;
    }

    // If we're writing, then we've clicked away after an edit
    // so we handle this with handle blur instead of creating a new element.
    if (action === 'writing') {
      return;
    }

    const { clientX, clientY } = getMouseCoordinates(e);

    if (tool === 'pan') {
      setAction('panning');
      panMouseStartPosition.current = { x: clientX, y: clientY };
      return;
    }

    const prevSelectionId = selectedElementIds[0];
    setSelectedElements([]);
    if (tool === 'select') {
      // Using selection tool. Check if cursor is near an element.
      // If so, select the element.
      // TODO: This should be optimized with a quadtree.
      const selectedElement = getElementAtPosition(clientX, clientY, {
        allIds,
        types,
        p1,
        p2,
        selectedElementId: selectedElementIds[0],
        angles,
      });
      if (selectedElement === undefined) {
        // Did not click an element, set selection frame if it doesn't exist
        setSelectionFrame({
          p1: {
            x: clientX,
            y: clientY,
          },
          p2: {
            x: clientX,
            y: clientY,
          },
        });
        return;
      }

      // Save the selection offset, since we want to maintain it
      // as we translate the element.
      const selectOffsetX = clientX - p1[selectedElement.id].x;
      const selectOffsetY = clientY - p1[selectedElement.id].y;
      selectOffset.current = { x: selectOffsetX, y: selectOffsetY };
      setSelectedElements([selectedElement.id]);

      // If we've mouse down on previously selected text element, then initiate an edit.
      if (
        types[selectedElement.id] === 'text' &&
        selectedElement.id === prevSelectionId &&
        selectedElement?.position === 'inside'
      ) {
        // We've clicked a text element, without dragging. Initiate an edit
        setAction('writing');
        return;
      }

      // If the cursor is inside the element's BB, we're translating.
      // We are resizing otherwise.
      if (selectedElement?.position === 'inside') {
        setAction('moving');
      } else if (selectedElement?.position === 'rotation') {
        setAction('rotating');
      } else {
        setAction('resizing');
      }
    } else if (isDrawingSelected) {
      // Not selection, then we're creating a new element.

      // Create a new element originating from the clicked point
      const id = generateRandId();
      const points = tool === 'freehand' ? ([] as Vector2[]) : undefined;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
        points,
        {
          // These require renaming because I was an idiot
          stroke: toolOptions.strokeColor,
          font: toolOptions.fontFamily,
          size: toolOptions.fontSize,
          fill: toolOptions.fillColor,
          ...toolOptions,
        },
      );
      if (tool === 'text') {
        element.text = '';
      }

      // Commit the element to state and set
      // our 'action state' to drawing.
      tool === 'freehand'
        ? addCanvasFreehand(element)
        : addCanvasShape(element);
      setAction(tool === 'text' ? 'writing' : 'drawing');
      currentDrawingElemId.current = id;
    } else if (tool == 'image' && pendingImageElementId !== '') {
      // The element was already created, we just need to initialize it at the location.
      const fileId = fileIds[pendingImageElementId];
      const image = fileId && imageCache.cache.get(fileId)?.image;

      if (!image || image instanceof Promise) {
        console.error('Image is not loaded');
        return;
      }

      const minHeight = Math.max(appHeight - 120, 160);
      // max 65% of canvas height, clamped to <300px, vh - 120px>
      const maxHeight = Math.min(minHeight, Math.floor(appHeight * 0.5) / zoom);

      const height = Math.min(image.naturalHeight, maxHeight);
      const width = height * (image.naturalWidth / image.naturalHeight);

      editCanvasElement(pendingImageElementId, {
        isImagePlaced: true,
        p1: { x: clientX - width / 2, y: clientY - height / 2 },
        p2: { x: clientX + width / 2, y: clientY + height / 2 },
      });
      // Dispatch the image to all clients
      setWebsocketAction(pendingImageElementId, 'addCanvasShape');
      // Unselect current image and reset cursor
      setPendingImageElement('');
      setCursor('');
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.button === PERIPHERAL_CODES.RIGHT_MOUSE) {
      return;
    }
    // Destroy the selection frame
    setSelectionFrame(null);

    // Reorder corners to align with the x1, y1 top left convention. This
    // is only needed if we were drawing, or resizing (otherwise, the corners wouldn't change).
    if (action === 'drawing' || action === 'resizing') {
      const id =
        action === 'drawing'
          ? currentDrawingElemId.current
          : selectedElementIds[0];
      const { x1, y1, x2, y2 } = adjustElementCoordinatesById(id, {
        p1,
        p2,
        types,
      });
      updateElement(id, x1, y1, x2, y2, types[id]);
    }

    if (action !== 'none') {
      pushCanvasHistory();
    }

    if (action === 'drawing') {
      const action =
        tool === 'freehand' ? 'addCanvasFreehand' : 'addCanvasShape';
      setWebsocketAction(currentDrawingElemId.current, action);
    }

    if (action === 'moving' || action === 'resizing' || action === 'rotating') {
      setWebsocketAction(selectedElementIds[0], 'editCanvasElement');
    }
    // Return to idle none action state, unless it's writing. We want to
    // write after a mouse up, so we'll set none explicitly.
    action !== 'writing' && setAction('none');
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.button === PERIPHERAL_CODES.RIGHT_MOUSE) {
      return;
    }
    const { clientX, clientY } = getMouseCoordinates(e);

    if (action === 'panning') {
      const deltaX = clientX - panMouseStartPosition.current.x;
      const deltaY = clientY - panMouseStartPosition.current.y;
      setPanOffset(panOffset.x + deltaX, panOffset.y + deltaY);
      return;
    }
    if (tool === 'select') {
      switch (action) {
        case 'moving': {
          // If moving, that means an element is selected. Translate it.
          if (selectedElementIds.length === 0 || selectOffset.current === null)
            return;
          const { x: x1, y: y1 } = p1[selectedElementIds[0]];
          const { x: x2, y: y2 } = p2[selectedElementIds[0]];
          const elementType = types[selectedElementIds[0]];

          // Translate by moving relative to clientXY,
          // but accounting for the selection offset. Maintain
          // the element's aspect ratio.
          const width = x2 - x1;
          const height = y2 - y1;
          updateElement(
            selectedElementIds[0],
            clientX - selectOffset.current.x,
            clientY - selectOffset.current.y,
            clientX - selectOffset.current.x + width,
            clientY - selectOffset.current.y + height,
            elementType,
          );

          break;
        }
        case 'rotating': {
          // If rotating, that means an element is selected.
          if (selectedElementIds.length === 0) return;

          const { x: x1, y: y1 } = p1[selectedElementIds[0]];
          const { x: x2, y: y2 } = p2[selectedElementIds[0]];

          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2;
          const angle =
            (5 * Math.PI) / 2 + Math.atan2(clientY - cy, clientX - cx);
          const normalizedAngle = normalizeAngle(angle);
          editCanvasElement(selectedElementIds[0], { angle: normalizedAngle });

          break;
        }
        case 'resizing': {
          // If resizing, that means an element is selected.
          if (
            selectedElementIds.length === 0 ||
            selectedHandlePositionRef.current === null
          )
            return;
          const { x: x1, y: y1 } = p1[selectedElementIds[0]];
          const { x: x2, y: y2 } = p2[selectedElementIds[0]];
          const elementType = types[selectedElementIds[0]];
          const angle = angles[selectedElementIds[0]] ?? 0;

          // Commit the adjusted coordinates.
          const {
            x1: x1r,
            y1: y1r,
            x2: x2r,
            y2: y2r,
          } = resizedCoordinates(
            clientX,
            clientY,
            angle,
            selectedHandlePositionRef.current,
            {
              x1,
              x2,
              y1,
              y2,
            },
          );

          // If the element is freehand, rescale the points.
          let points = freehandPoints[selectedElementIds[0]];
          if (points !== undefined) {
            const [width, height] = [x2r - x1r, y2r - y1r];
            points = rescalePointsInElem(points, width, height, false);
            editCanvasElement(selectedElementIds[0], {
              freehandPoints: points,
            });
          }

          updateElement(selectedElementIds[0], x1r, y1r, x2r, y2r, elementType);
          break;
        }
        default: {
          // Otherwise, we're in the none state, either hovering the mouse or creating a selection frame.
          if (isSelectionFrameSet) {
            // Update the frame
            setSelectionFrame({
              p2: {
                x: clientX,
                y: clientY,
              },
            });
          } else {
            // Check if we hover a handle/element
            const hoveredElement = getElementAtPosition(clientX, clientY, {
              allIds,
              types,
              p1,
              p2,
              selectedElementId: selectedElementIds[0],
              angles,
            });

            // Save the last handle position since we need it to know how to change
            // the coordinates when resizing.
            if (
              hoveredElement?.position &&
              hoveredElement?.position !== 'inside' &&
              hoveredElement?.position !== 'rotation'
            ) {
              selectedHandlePositionRef.current = hoveredElement?.position;
            } else {
              selectedHandlePositionRef.current = null;
            }

            // Change the cursor accordingly to denote a possible action.
            (e.target as HTMLElement).style.cursor = hoveredElement?.position
              ? cursorForPosition(
                  hoveredElement.position,
                  angles[hoveredElement.id],
                  p1[hoveredElement.id],
                  p2[hoveredElement.id],
                  types[hoveredElement.id],
                )
              : 'default';
            break;
          }
        }
      }
    } else if (isDrawingSelected) {
      // Not selection tool, so drawing an element.
      if (action !== 'drawing') return;

      // Otherwise, update the element we're currently drawing
      const { x: x1, y: y1 } = p1[currentDrawingElemId.current] ?? {};
      const points = freehandPoints[currentDrawingElemId.current];
      updateElement(
        currentDrawingElemId.current,
        x1,
        y1,
        clientX,
        clientY,
        tool,
        { points },
      );
    }
  };

  return (
    <>
      <canvas
        id="canvas"
        style={{
          backgroundColor: 'transparent',
          position: 'absolute',
          zIndex: 5,
        }}
        width={appWidth}
        height={appHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      {tool === 'select' &&
        attachedFileUrls[selectedElementIds[0]] !== undefined && (
          <a
            href={attachedFileUrls[selectedElementIds[0]]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <FileIcon />
          </a>
        )}

      {action === 'writing' && (
        <textarea
          ref={textAreaRef}
          style={{
            position: 'fixed',
            top:
              ((p1[selectedElementIds[0]]?.y ??
                p1[currentDrawingElemId.current]?.y) -
                (fontSizeOffsets[
                  fontFamilies[
                    selectedElementIds[0] ?? currentDrawingElemId.current
                  ]
                ]?.[
                  fontSizes[
                    selectedElementIds[0] ?? currentDrawingElemId.current
                  ]
                ] ?? 0) +
                panOffset.y) *
                zoom -
              scaleOffset.y,
            left:
              ((p1[selectedElementIds[0]]?.x ??
                p1[currentDrawingElemId.current]?.x) +
                panOffset.x) *
                zoom -
              scaleOffset.x,
            font: `${
              fontSizes[selectedElementIds[0] ?? currentDrawingElemId.current] *
              zoom
            }px ${
              fontFamilies[
                selectedElementIds[0] ?? currentDrawingElemId.current
              ]
            }`,
            color:
              strokeColors[
                selectedElementIds[0] ?? currentDrawingElemId.current
              ],
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            resize: 'none',
            overflow: 'hidden',
            whiteSpace: 'pre',
            background: 'transparent',
          }}
          onBlur={handleTextBlur}
        />
      )}
    </>
  );
}
