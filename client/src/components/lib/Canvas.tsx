import React, { MouseEvent, useEffect, useRef, FocusEvent } from 'react';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import {
  adjustElementCoordinatesById,
  resizedCoordinates,
} from '@/lib/canvasElements/resize';
import {
  cursorForPosition,
  getElementAtPosition,
} from '@/lib/canvasElements/selection';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import {
  AppTool,
  CanvasElementType,
  TransformHandleDirection,
  Vector2,
} from '@/types';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { getScaleOffset } from '@/lib/canvasElements/render';
import { TEXT_FONT_FAMILY, TEXT_FONT_SIZE } from '@/constants';
import { getCanvasContext } from '@/lib/misc';

/**
 * Main Canvas View
 * @authors Yousef Yassin, Dana El Sherif
 */

const drawingTools = [
  'line',
  'rectangle',
  'circle',
  'freehand',
  'text',
] as const;
const drawingToolsSet = new Set(drawingTools);
const isDrawingTool = (tool: AppTool): tool is (typeof drawingTools)[number] =>
  drawingToolsSet.has(tool as (typeof drawingTools)[number]);

export default function Canvas() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
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
  ]);
  const {
    addCanvasShape,
    addCanvasFreehand,
    editCanvasElement,
    p1,
    p2,
    types,
    allIds,
    selectedElementId,
    freehandPoints,
    pushCanvasHistory,
    setSelectedElement,
    strokeColors,
    fillColors,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    textStrings,
  } = useCanvasElementStore([
    'addCanvasShape',
    'addCanvasFreehand',
    'editCanvasElement',
    'p1',
    'p2',
    'types',
    'allIds',
    'setSelectedElement',
    'freehandPoints',
    'selectedElementId',
    'pushCanvasHistory',
    'setSelectedElement',
    'strokeColors',
    'fillColors',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'textStrings',
  ]);

  const { setWebsocketAction, setRoomID } = useWebSocketStore([
    'setWebsocketAction',
    'setRoomID',
  ]);

  // Id of the element currently being drawn.
  const selectOffset = useRef<Vector2 | null>(null);
  // Id of the element being drawn (for the first time).
  const currentDrawingElemId = useRef('');
  const panMouseStartPosition = useRef({ x: 0, y: 0 } as Vector2);
  // Position of the transform handle last used.
  const selectedHandlePositionRef = useRef<TransformHandleDirection | null>(
    null,
  );

  // Initalize roomID upon entering the canvas
  useEffect(() => {
    setRoomID('1'); // Change later
    return () => setRoomID(null);
  }, []);

  // Initializes text-area on text edit.
  useEffect(() => {
    // Auto-focus text-area on writing init, and add existing text, if any.
    if (action === 'writing') {
      // Needs the delay for relinquishing the thread for some reason
      setTimeout(() => {
        if (textAreaRef.current === null) return;
        textAreaRef.current.focus();
        selectedElementId !== '' &&
          (textAreaRef.current.value = textStrings[selectedElementId]);
      }, 0);
    }
  }, [action, selectedElementId, textStrings]);

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
  const getMouseCoordinates = (e: MouseEvent<HTMLCanvasElement>) => {
    const clientX = (e.clientX - panOffset.x * zoom + scaleOffset.x) / zoom;
    const clientY = (e.clientY - panOffset.y * zoom + scaleOffset.y) / zoom;
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
        bowing: bowings[id],
        roughness: roughnesses[id],
        strokeWidth: strokeWidths[id],
        fillStyle: fillStyles[id],
        strokeLineDash: strokeLineDashes[id],
        opacity: opacities[id],
        text: options?.text ?? '',
      },
    );
    editCanvasElement(id, {
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      roughElement: updatedElement.roughElement,
      freehandPoints: updatedElement.freehandPoints,
      text: updatedElement.text,
    });
  };

  /**
   * Handles committing text updates once the textbox is unfocused.
   */
  const handleTextBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    const elementId = selectedElementId || currentDrawingElemId.current;
    const { x: x1, y: y1 } = p1[elementId];
    const elementType = types[elementId];

    const text = e?.target?.value;
    const { ctx } = getCanvasContext();
    if (ctx === null) return;

    // Set the element's font style so measuretext
    // calculates the correct width.
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font = `${TEXT_FONT_SIZE}px ${TEXT_FONT_FAMILY}`;
    const textWidth = ctx.measureText(text).width;
    ctx.restore();

    const textHeight = TEXT_FONT_SIZE;
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

    // Cleanup
    setAction('none');
    setSelectedElement('');
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
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
    setSelectedElement('');
    if (tool === 'select') {
      // Using selection tool. Check if cursor is near an element.
      // If so, select the element.
      // TODO: This should be optimized with a quadtree.
      const selectedElement = getElementAtPosition(clientX, clientY, {
        allIds,
        types,
        p1,
        p2,
        selectedElementId,
      });

      if (selectedElement === undefined) return;

      // Save the selection offset, since we want to maintain it
      // as we translate the element.
      const selectOffsetX = clientX - p1[selectedElement.id].x;
      const selectOffsetY = clientY - p1[selectedElement.id].y;
      selectOffset.current = { x: selectOffsetX, y: selectOffsetY };
      setSelectedElement(selectedElement.id);

      // If the cursor is inside the element's BB, we're translating.
      // We are resizing otherwise.
      if (selectedElement?.position === 'inside') {
        setAction('moving');
      } else {
        setAction('resizing');
      }
    } else if (isDrawingSelected) {
      // Not selection, then we're creating a new element.

      // Create a new element originating from the clicked point
      const id = crypto.randomUUID();
      const points = tool === 'freehand' ? ([] as Vector2[]) : undefined;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
        points,
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
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = getMouseCoordinates(e);
    // If we've mouse uped, and the position is close to the selection
    // position of a text eleement, then initiate an edit.
    if (
      selectedElementId !== '' &&
      types[selectedElementId] === 'text' &&
      clientX - (selectOffset.current?.x ?? 0) - p1[selectedElementId].x < 1 &&
      clientY - (selectOffset.current?.y ?? 0) - p1[selectedElementId].y < 1
    ) {
      // We've clicked a text element, without dragging. Initiate an edit
      setAction('writing');
      return;
    }

    // Reorder corners to align with the x1, y1 top left convention. This
    // is only needed if we were drawing, or resizing (otherwise, the corners wouldn't change).
    if (action === 'drawing' || action === 'resizing') {
      const id =
        action === 'drawing' ? currentDrawingElemId.current : selectedElementId;
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
      setWebsocketAction(currentDrawingElemId.current, tool);
    }

    // Return to idle none action state, unless it's writing. We want to
    // write after a mouse up, so we'll set none explicitly.
    action !== 'writing' && setAction('none');
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
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
          if (selectedElementId === '' || selectOffset.current === null) return;
          const { x: x1, y: y1 } = p1[selectedElementId];
          const { x: x2, y: y2 } = p2[selectedElementId];
          const elementType = types[selectedElementId];

          // Translate by moving relative to clientXY,
          // but accounting for the selection offset. Maintain
          // the element's aspect ratio.
          const width = x2 - x1;
          const height = y2 - y1;
          updateElement(
            selectedElementId,
            clientX - selectOffset.current.x,
            clientY - selectOffset.current.y,
            clientX - selectOffset.current.x + width,
            clientY - selectOffset.current.y + height,
            elementType,
          );
          break;
        }
        case 'resizing': {
          // If resizing, that means an element is selected.
          if (
            selectedElementId === '' ||
            selectedHandlePositionRef.current === null
          )
            return;
          const { x: x1, y: y1 } = p1[selectedElementId];
          const { x: x2, y: y2 } = p2[selectedElementId];
          const elementType = types[selectedElementId];

          // Commit the adjusted coordinates.
          const {
            x1: x1r,
            y1: y1r,
            x2: x2r,
            y2: y2r,
          } = resizedCoordinates(
            clientX,
            clientY,
            selectedHandlePositionRef.current,
            {
              x1,
              x2,
              y1,
              y2,
            },
          );
          updateElement(selectedElementId, x1r, y1r, x2r, y2r, elementType);
          break;
        }
        default: {
          // Otherwise, we're in the none state and just hovering the mouse.
          // Check if we hover a handle/element
          const hoveredElement = getElementAtPosition(clientX, clientY, {
            allIds,
            types,
            p1,
            p2,
            selectedElementId,
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
            ? cursorForPosition(hoveredElement.position)
            : 'default';
          break;
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
        style={{ backgroundColor: 'white' }}
        width={appWidth}
        height={appHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      {action === 'writing' && (
        <textarea
          ref={textAreaRef}
          style={{
            position: 'fixed',
            // TODO: using 3 here is not ideal
            top:
              ((p1[selectedElementId]?.y ??
                p1[currentDrawingElemId.current]?.y) -
                3 +
                panOffset.y) *
                zoom -
              scaleOffset.y,
            left:
              ((p1[selectedElementId]?.x ??
                p1[currentDrawingElemId.current]?.x) +
                panOffset.x) *
                zoom -
              scaleOffset.x,
            font: `${TEXT_FONT_SIZE * zoom}px ${TEXT_FONT_FAMILY}`,
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
