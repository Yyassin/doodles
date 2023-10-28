import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import {
  cursorForPosition,
  getElementAtPosition,
} from '@/lib/canvasElements/selection';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { CanvasElementType } from '@/types';
import React, { MouseEvent, useState } from 'react';

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
  // A canvas state machine defining the current "state" action.
  const [action, setAction] = useState<Action>('none');
  // Id of the element currently being drawn.
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
      // Using selection tool. Check if cursor is near an element.
      // If so, select it. This should be optimized with a quadtree.
      const selectedElement = getElementAtPosition(clientX, clientY, {
        allIds,
        types,
        p1,
        p2,
      });
      selectedElement && setSelectedElement(selectedElement.id);
    } else if (tool === 'line' || tool === 'rectangle') {
      // Otherwise, we're creating a new element.

      // Create a new element originating from the clicked point
      const id = crypto.randomUUID();
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
      );

      // Commit the element to state
      addCanvasElement(element);
      setAction('drawing');
      setCurrentDrawingElemId(id);
    }
  };

  const handleMouseUp = () => {
    // Return to idle none action state.
    setAction('none');
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    if (tool === 'select') {
      // If selection tool, check if we're hovering an element
      // and update the cursor to denote a possible drag action.
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

      // Otherwise, update the element we're currently drawing
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
