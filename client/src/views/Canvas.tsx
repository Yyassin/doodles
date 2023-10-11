import useDrawElements from '@/hooks/useDrawElements';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { CanvasElementType } from '@/types';
import React, { MouseEvent, useState } from 'react';

/**
 * Main Canvas View
 * @authors Yousef Yassin
 */

// TODO: We need a layout component, and viewport and this will go inside viewport.

type Action = 'none' | 'drawing';

export default function Canvas() {
  const { mode, setMode } = useAppStore(['mode', 'setMode']);
  const { addCanvasElement, editCanvasElement, p1 } = useCanvasElementStore([
    'addCanvasElement',
    'editCanvasElement',
    'p1',
  ]);
  const [action, setAction] = useState<Action>('none');
  const [currentDrawingElemId, setCurrentDrawingElemId] = useState('');
  useDrawElements();

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
    if (mode !== 'line' && mode !== 'rectangle') return;
    const { clientX, clientY } = e;

    // Create a new element, initially just a point where we clicked
    const id = crypto.randomUUID();
    const element = createElement(id, clientX, clientY, clientX, clientY, mode);

    // Add the element
    addCanvasElement(element);
    setAction('drawing');
    setCurrentDrawingElemId(id);
  };

  const handleMouseUp = () => {
    setAction('none');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (mode !== 'line' && mode !== 'rectangle') return;
    const { clientX, clientY } = e;

    if (action !== 'drawing') return;
    const { x: x1, y: y1 } = p1[currentDrawingElemId];

    updateElement(currentDrawingElemId, x1, y1, clientX, clientY, mode);
  };

  return (
    <div>
      {/*TODO: Will replace with dropdown */}
      <div style={{ position: 'fixed' }}>
        <input
          type="radio"
          id="line"
          checked={mode === 'line'}
          onChange={() => setMode('line')}
        />
        <label htmlFor="line">Line</label>
        <input
          type="radio"
          id="rectangle"
          checked={mode === 'rectangle'}
          onChange={() => setMode('rectangle')}
        />
        <label htmlFor="line">Rectangle</label>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerWidth}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        Canvas
      </canvas>
    </div>
  );
}
