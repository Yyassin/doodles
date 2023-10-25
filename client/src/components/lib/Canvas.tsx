import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { useAppStore } from '@/stores/AppStore';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { CanvasElementType, Vector2 } from '@/types';
import React, { MouseEvent, useState } from 'react';

// TODO: To object
const cursorForPosition = (position: string) => {
  switch (position) {
    case 'tl':
    case 'br':
    case 'start':
    case 'end':
      return 'nwse-resize';
    case 'tr':
    case 'bl':
      return 'nesw-resize';
    default:
      return 'move';
  }
};

const distance = (a: Vector2, b: Vector2) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const nearPoint = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  name: string,
  thresh = 5,
) => {
  return Math.abs(x - x1) < thresh && Math.abs(y - y1) < thresh ? name : null;
};

const positionWithinElement = (
  x: number,
  y: number,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    types: Record<string, CanvasElement['type']>;
  },
  selection: string,
) => {
  const { p1, p2, types } = appState;
  const elementType = types[selection];
  const { x: x1, y: y1 } = p1[selection];
  const { x: x2, y: y2 } = p2[selection];

  if (elementType === 'rectangle') {
    const topLeft = nearPoint(x, y, x1, y1, 'tl');
    const topRight = nearPoint(x, y, x2, y1, 'tr');
    const bottomLeft = nearPoint(x, y, x1, y2, 'bl');
    const bottomRight = nearPoint(x, y, x2, y2, 'br');
    // Within if mouse is between extents
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;

    // Only one of these should ever be true -- unless the shape is small
    // but it's still possible to force one since inside is first.
    return inside || topLeft || topRight || bottomLeft || bottomRight;
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

    const start = nearPoint(x, y, x1, y1, 'start');
    const end = nearPoint(x, y, x2, y2, 'end');
    const inside = Math.abs(offset) < 1 ? 'inside' : null;
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
    .find((element) => element.position !== null);
};

/**
 * Main Canvas View
 * @authors Yousef Yassin
 */

type Action = 'none' | 'drawing';

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
    setSelectedElement,
  } = useCanvasElementStore([
    'addCanvasElement',
    'editCanvasElement',
    'p1',
    'p2',
    'types',
    'allIds',
    'setSelectedElement',
  ]);
  const [action, setAction] = useState<Action>('none');
  const [currentDrawingElemId, setCurrentDrawingElemId] = useState('');

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
      });
      selectedElement && setSelectedElement(selectedElement.id);
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
    setAction('none');
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    if (tool === 'select') {
      const hoveredElement = getElementAtPosition(clientX, clientY, {
        allIds,
        types,
        p1,
        p2,
      });
      (e.target as HTMLElement).style.cursor = hoveredElement?.position
        ? cursorForPosition(hoveredElement.position)
        : 'default';
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
