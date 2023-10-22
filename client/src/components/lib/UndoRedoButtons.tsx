import { ResetIcon } from '@radix-ui/react-icons';
import React from 'react';
import { CanvasFlatButton } from './CanvasButton';

/**
 * Defines a set out buttons for undoing
 * and redoing actions.
 * @author Yousef Yassin
 */

const UndoRedoButtons = () => {
  return (
    <div
      className="flex w-full min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      style={{
        width: 'fit-content',
      }}
    >
      <CanvasFlatButton
        className="rounded-l-md"
        onClick={() => console.log('Undo')}
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
        onClick={() => console.log('Redo')}
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
