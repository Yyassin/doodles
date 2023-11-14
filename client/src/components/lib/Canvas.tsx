import React, { MouseEvent, useEffect, useRef } from 'react';
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
type Action = 'none' | 'drawing' | 'resizing' | 'moving';

export default function Canvas() {
  const { tool, appHeight, appWidth } = useAppStore([
    'tool',
    'appHeight',
    'appWidth',
    'setMode',
  ]);
  const {
    addCanvasShape,
    addCanvasFreehand,
    addCanvasText,
    editCanvasElement,
    p1,
    p2,
    types,
    allIds,
    selectedElementId,
    freehandPoints,
    textElem,
    pushCanvasHistory,
    setSelectedElement,
  } = useCanvasElementStore([
    'addCanvasShape',
    'addCanvasFreehand',
    'editCanvasElement',
    'addCanvasText',
    'p1',
    'p2',
    'types',
    'allIds',
    'setSelectedElement',
    'freehandPoints',
    'textElem',
    'selectedElementId',
    'pushCanvasHistory',
    'setSelectedElement',
  ]);

  const { setCounter, setRoomID } = useWebSocketStore([
    'setCounter',
    'setRoomID',
  ]);

  // A canvas state machine defining the current "state" action.
  const action = useRef<Action>('none');
  // Id of the element currently being drawn.
  const selectOffset = useRef<Vector2 | null>(null);
  // Id of the element being drawn (for the first time).
  const currentDrawingElemId = useRef('');
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  // Position of the transform handle last used.
  const selectedHandlePositionRef = useRef<TransformHandleDirection | null>(
    null,
  );

  // Initalize roomID upon entering the canvas
  useEffect(() => {
    setRoomID('1'); // Change later
    return () => setRoomID(null);
  }, []);

  useEffect(() => {
    const textArea = textAreaRef.current;
    console.log(textArea);
    if (tool === 'text' && textArea) {
      textArea.focus();
    }
  }, [tool]);

  const isDrawingSelected = isDrawingTool(tool);

  // Update a canvas element's position state.
  const updateElement = (
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: CanvasElementType,
    points?: Vector2[],
    text?: string,
  ) => {
    const updatedElement = createElement(
      id,
      x1,
      y1,
      x2,
      y2,
      type,
      points,
      text,
    );
    editCanvasElement(id, {
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      roughElement: updatedElement.roughElement,
      freehandPoints: updatedElement.freehandPoints,
      textElem: updatedElement.textElem,
    });
  };

  const handleText = () => {
    const updatedText = textAreaRef.current?.value || '';
    if (tool === 'text' && action.current === 'drawing') {
      // Update the text of the text element
      editCanvasElement(currentDrawingElemId.current, {
        textElem: updatedText,
      });

      // Reset the text area value
      if (textAreaRef.current) {
        textAreaRef.current.value = '';
        textAreaRef.current.focus();
      }
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = e;
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
        action.current = 'moving';
      } else {
        action.current = 'resizing';
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

      // Commit the element to state and set
      // our 'action state' to drawing.
      if (tool === 'freehand') {
        addCanvasFreehand(element);
      } else if (tool === 'text') {
        addCanvasText(element);
        handleText();
      } else {
        addCanvasShape(element);
      }
      action.current = 'drawing';
      currentDrawingElemId.current = id;
    }
  };

  const handleMouseUp = () => {
    // if (tool === 'text') return;
    // Reorder corners to align with the x1, y1 top left convention. This
    // is only needed if we were drawing, or resizing (otherwise, the corners wouldn't change).
    if (action.current === 'drawing' || action.current === 'resizing') {
      const id =
        action.current === 'drawing'
          ? currentDrawingElemId.current
          : selectedElementId;
      const { x1, y1, x2, y2 } = adjustElementCoordinatesById(id, {
        p1,
        p2,
        types,
      });
      updateElement(id, x1, y1, x2, y2, types[id]);
    }

    if (action.current !== 'none') {
      pushCanvasHistory();
    }

    setCounter();
    // Return to idle none action state.
    action.current = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    if (tool === 'select') {
      switch (action.current) {
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
      if (action.current !== 'drawing') return;

      // Otherwise, update the element we're currently drawing
      const { x: x1, y: y1 } = p1[currentDrawingElemId.current] ?? {};
      const points = freehandPoints[currentDrawingElemId.current];
      const text = textElem[currentDrawingElemId.current];
      updateElement(
        currentDrawingElemId.current,
        x1,
        y1,
        clientX,
        clientY,
        tool,
        points,
        text,
      );
    }
  };

  return (
    <div>
      <canvas
        id="canvas"
        style={{ backgroundColor: 'white' }}
        width={appWidth}
        height={appHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />

      {tool === 'text' ? (
        <textarea
          ref={textAreaRef}
          // onBlur={handleBlur}
          style={{
            position: 'fixed',
            top: p1[currentDrawingElemId.current]?.y,
            left: p1[currentDrawingElemId.current]?.x,
          }}
        />
      ) : null}
    </div>
  );
}
