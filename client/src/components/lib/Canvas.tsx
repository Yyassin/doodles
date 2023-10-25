import {
  MaybeTransformHandleType,
  TransformHandle,
  TransformHandleDirection,
  TransformHandleType,
  getTransformHandlesFromCoords,
} from '@/hooks/useDrawElements';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { useAppStore } from '@/stores/AppStore';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { CanvasElementType, Vector2 } from '@/types';
import React, { MouseEvent, useRef, useState } from 'react';

const resizedCoordinates = (
  clientX: number,
  clientY: number,
  position: TransformHandleDirection,
  coordinates: { x1: number; y1: number; x2: number; y2: number },
) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case 'nw':
      return { x1: clientX, y1: clientY, x2, y2 };
    case 'ne':
      return { x1, y1: clientY, x2: clientX, y2 };
    case 'sw':
      return { x1: clientX, x2, y1, y2: clientY };
    case 'se':
      return { x1, y1, x2: clientX, y2: clientY };
    case 'n':
      return { x1, y1: clientY, x2, y2 };
    case 'e':
      return { x1, y1, x2: clientX, y2 };
    case 's':
      return { x1, y1, x2, y2: clientY };
    case 'w':
      return { x1: clientX, y1, x2, y2 };
    default:
      throw new Error(
        `Something went wrong. Resize position ${position} is invalid.`,
      );
  }
};

const adjustElementCoordinates = (
  elementId: string,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
  },
) => {
  const { p1, p2, types } = appState;
  const { x: x1, y: y1 } = p1[elementId];
  const { x: x2, y: y2 } = p2[elementId];
  const elementType = types[elementId];

  if (elementType === 'rectangle') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // x1, x2 is top left
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    // a line
    if (x1 < x2 || (x1 === x2 && y1 < y2) /* top is x1, y1 */) {
      return { x1, y1, x2, y2 };
    } else {
      // we need to swap the vertices
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

const isInsideTransformHandle = (
  transformHandle: TransformHandle,
  x: number,
  y: number,
) =>
  x >= transformHandle[0] &&
  x <= transformHandle[0] + transformHandle[2] &&
  y >= transformHandle[1] &&
  y <= transformHandle[1] + transformHandle[3];

export const resizeTest = (
  elementId: string,
  appState: {
    // Eventually, an array
    selectedElementIds: string;
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
  },
  x: number,
  y: number,
): MaybeTransformHandleType => {
  const { selectedElementIds, p1, p2 } = appState;

  if (elementId !== selectedElementIds) {
    return false;
  }

  const { rotation: rotationTransformHandle, ...transformHandles } =
    getTransformHandlesFromCoords({ p1, p2 }, selectedElementIds, {
      rotation: true,
    });

  if (
    rotationTransformHandle &&
    isInsideTransformHandle(rotationTransformHandle, x, y)
  ) {
    return 'rotation' as TransformHandleType;
  }

  const filter = Object.keys(transformHandles).filter((key) => {
    const transformHandle =
      transformHandles[key as Exclude<TransformHandleType, 'rotation'>];
    if (transformHandle === undefined) {
      return false;
    }
    return isInsideTransformHandle(transformHandle, x, y);
  });

  if (filter.length > 0) {
    return filter[0] as TransformHandleType;
  }

  return false;
};

// TODO: To object
const cursorForPosition = (
  transformHandleType: MaybeTransformHandleType | 'inside',
): string => {
  const shouldSwapCursors = false;
  // const shouldSwapCursors =
  //   element && Math.sign(element.height) * Math.sign(element.width) === -1;
  let cursor = null;

  switch (transformHandleType) {
    case 'n':
    case 's':
      cursor = 'ns';
      break;
    case 'w':
    case 'e':
      cursor = 'ew';
      break;
    case 'nw':
    case 'se':
      if (shouldSwapCursors) {
        cursor = 'nesw';
      } else {
        cursor = 'nwse';
      }
      break;
    case 'ne':
    case 'sw':
      if (shouldSwapCursors) {
        cursor = 'nwse';
      } else {
        cursor = 'nesw';
      }
      break;
    case 'rotation':
      return 'grab';
    default:
      return 'move';
  }

  // if (cursor && element) {
  //   cursor = rotateResizeCursor(cursor, element.angle);
  // }

  return cursor ? `${cursor}-resize` : '';
};

const distance = (a: Vector2, b: Vector2) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const nearPoint = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  name: TransformHandleDirection,
  thresh = 5,
) => {
  return Math.abs(x - x1) < thresh && Math.abs(y - y1) < thresh ? name : false;
};

const positionWithinElement = (
  x: number,
  y: number,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
    selectedElementId: string;
  },
  selection: string,
): MaybeTransformHandleType | 'inside' => {
  const { p1, p2, types, selectedElementId } = appState;
  const elementType = types[selection];
  const { x: x1, y: y1 } = p1[selection];
  const { x: x2, y: y2 } = p2[selection];

  if (elementType === 'rectangle') {
    const transformHandle = resizeTest(
      selection,
      { selectedElementIds: selectedElementId, p1, p2 },
      x,
      y,
    );
    // Within if mouse is between extents
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;

    // Only one of these should ever be true -- unless the shape is small
    // but it's still possible to force one since inside is first.
    return inside || transformHandle;
  } else {
    // TODO: Could do distance from point to line
    // Line -- what we do is measure dist from point to
    // both endpoints. If it's close enough to line length
    // then we say this is selecting the line.
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y }; // mouse pos

    // TODO: Can we optimize with no sqrt?
    const offset = Math.abs(distance(a, b) - (distance(c, a) + distance(c, b)));

    const start = nearPoint(x, y, x1, y1, 'nw'); // so it resizes x1, y1
    const end = nearPoint(x, y, x2, y2, 'se'); // so it resizes x2, y2
    const inside = Math.abs(offset) < 1 ? 'inside' : false;
    return inside || start || end;
  }
};

const getElementAtPosition = (
  x: number,
  y: number,
  appState: {
    allIds: string[];
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
    selectedElementId: string;
  },
) => {
  // Disadvantage: O(n) and it only returns the first element this satisfies -- will
  // be an issue for overlapping elements: One solution is added some sort of layering (move to front/back)
  // for each element. We have to find all that intersect and select front most.
  return appState.allIds
    .map((id) => ({
      id,
      position: positionWithinElement(x, y, appState, id),
    }))
    .find((element) => element.position);
};

/**
 * Main Canvas View
 * @authors Yousef Yassin
 */

type Action = 'none' | 'drawing' | 'resizing' | 'moving';

export default function Canvas() {
  const { tool, appHeight, appWidth } = useAppStore([
    'tool',
    'appHeight',
    'appWidth',
    'setMode',
  ]);
  const {
    addCanvasElement,
    editCanvasElement,
    p1,
    p2,
    types,
    allIds,
    selectedElementId,
    setSelectedElement,
  } = useCanvasElementStore([
    'addCanvasElement',
    'editCanvasElement',
    'p1',
    'p2',
    'types',
    'allIds',
    'setSelectedElement',
    'selectedElementId',
  ]);
  // TODO: These can be refs?
  const [action, setAction] = useState<Action>('none');
  const [selectOffset, setSelectOffset] = useState<Vector2 | null>(null);
  const [currentDrawingElemId, setCurrentDrawingElemId] = useState('');
  const selectedHandlePositionRef = useRef<TransformHandleDirection | null>(
    null,
  );

  const updateElement = (
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: CanvasElementType,
  ) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type);
    editCanvasElement(id, {
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      roughElement: updatedElement.roughElement,
    });
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = e;
    setSelectedElement('');
    if (tool === 'select') {
      // Check if we're on an element. This should be optimized
      // with a quadtree.
      const selectedElement = getElementAtPosition(clientX, clientY, {
        allIds,
        types,
        p1,
        p2,
        selectedElementId,
      });

      if (selectedElement === undefined) return;

      const selectOffsetX = clientX - p1[selectedElement.id].x;
      const selectOffsetY = clientY - p1[selectedElement.id].y;
      setSelectOffset({ x: selectOffsetX, y: selectOffsetY });
      setSelectedElement(selectedElement.id);

      if (selectedElement?.position === 'inside') {
        setAction('moving');
      } else {
        setAction('resizing');
      }
    } else {
      // TODO: Not good
      if (tool !== 'line' && tool !== 'rectangle') return;

      // Create a new element, initially just a point where we clicked
      const id = crypto.randomUUID();
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
      );

      // Add the element
      addCanvasElement(element);
      setAction('drawing');
      setCurrentDrawingElemId(id);
    }
  };

  const handleMouseUp = () => {
    // Reorder corners : if drawing, or resizing
    if (action === 'drawing' || action === 'resizing') {
      const { x1, y1, x2, y2 } = adjustElementCoordinates(
        currentDrawingElemId,
        { p1, p2, types },
      );
      updateElement(
        currentDrawingElemId,
        x1,
        y1,
        x2,
        y2,
        types[currentDrawingElemId],
      );
    }
    setAction('none');
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    if (tool === 'select') {
      switch (action) {
        case 'moving': {
          if (selectedElementId === '' || selectOffset === null) return;
          const { x: x1, y: y1 } = p1[selectedElementId];
          const { x: x2, y: y2 } = p2[selectedElementId];
          const elementType = types[selectedElementId];

          const width = x2 - x1;
          const height = y2 - y1;

          // Translate: make clientXY top left
          updateElement(
            selectedElementId,
            clientX - selectOffset.x,
            clientY - selectOffset.y,
            clientX - selectOffset.x + width,
            clientY - selectOffset.y + height,
            elementType,
          );
          break;
        }
        case 'resizing': {
          if (
            selectedElementId === '' ||
            selectedHandlePositionRef.current === null
          )
            return;
          const { x: x1, y: y1 } = p1[selectedElementId];
          const { x: x2, y: y2 } = p2[selectedElementId];
          const elementType = types[selectedElementId];

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
          // TODO: Need an adjust element coords to account for flip here
          updateElement(selectedElementId, x1r, y1r, x2r, y2r, elementType);
          break;
        }
        default: {
          const hoveredElement = getElementAtPosition(clientX, clientY, {
            allIds,
            types,
            p1,
            p2,
            selectedElementId,
          });
          if (
            hoveredElement?.position &&
            hoveredElement?.position !== 'inside' &&
            hoveredElement?.position !== 'rotation'
          ) {
            selectedHandlePositionRef.current = hoveredElement?.position;
          } else {
            selectedHandlePositionRef.current = null;
          }

          (e.target as HTMLElement).style.cursor = hoveredElement?.position
            ? cursorForPosition(hoveredElement.position)
            : 'default';
          break;
        }
      }
    } else if (tool === 'line' || tool === 'rectangle') {
      if (action !== 'drawing') return;
      const { x: x1, y: y1 } = p1[currentDrawingElemId];

      updateElement(currentDrawingElemId, x1, y1, clientX, clientY, tool);
    }
  };

  return (
    <canvas
      id="canvas"
      style={{ backgroundColor: 'white' }}
      width={appWidth}
      height={appHeight}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    />
  );
}
