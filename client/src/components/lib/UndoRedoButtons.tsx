import { ResetIcon } from '@radix-ui/react-icons';
import React from 'react';
import { CanvasFlatButton } from './CanvasButton';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';

/**
 * Defines a set out buttons for undoing
 * and redoing actions.
 * @authors Yousef Yassin, Dana El Sherif
 */

const UndoRedoButtons = () => {
  const { undoCanvasElementState, redoCanvasElementState } =
    useCanvasElementStore(['undoCanvasElementState', 'redoCanvasElementState']);

  const handleUndo = () => {
    undoCanvasElementState();
  };
  const handleRedo = () => {
    redoCanvasElementState();
  };

  return (
    <div
      className="flex w-full min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      style={{
        width: 'fit-content',
      }}
    >
      <CanvasFlatButton
        className="rounded-l-md"
        onClick={handleUndo}
        tooltip={{
          content: 'Undo',
          side: 'top',
          sideOffset: 5,
        }}
      >
        <ResetIcon />
      </CanvasFlatButton>
      <CanvasFlatButton
        className="rounded-r-md"
        onClick={handleRedo}
        tooltip={{
          content: 'Redo',
          side: 'top',
          sideOffset: 5,
        }}
      >
        <ResetIcon
          style={{
            transform: 'scaleX(-1)',
          }}
        />
      </CanvasFlatButton>
    </div>
  );
};

export default UndoRedoButtons;
