import { createElement } from '@/lib/canvasElements/canvasElementUtils';
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
  const { addCanvasElement, editCanvasElement, p1 } = useCanvasElementStore([
    'addCanvasElement',
    'editCanvasElement',
    'p1',
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
    // TODO: Not good
    if (tool !== 'line' && tool !== 'rectangle') return;
    const { clientX, clientY } = e;

    // Create a new element, initially just a point where we clicked
    const id = crypto.randomUUID();
    const element = createElement(id, clientX, clientY, clientX, clientY, tool);

    // Add the element
    addCanvasElement(element);
    setAction('drawing');
    setCurrentDrawingElemId(id);
  };

  const handleMouseUp = () => {
    setAction('none');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (tool !== 'line' && tool !== 'rectangle') return;
    const { clientX, clientY } = e;

    if (action !== 'drawing') return;
    const { x: x1, y: y1 } = p1[currentDrawingElemId];

    updateElement(currentDrawingElemId, x1, y1, clientX, clientY, tool);
  };

  return (
    <canvas
      id="canvas"
      width={appWidth}
      height={appHeight}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    />
  );
}
