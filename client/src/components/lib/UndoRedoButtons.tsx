import { ResetIcon } from '@radix-ui/react-icons';
import React from 'react';
import { CanvasFlatButton } from './CanvasButton';
import {
  history,
  historyIndex,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';

/**
 * Defines a set out buttons for undoing
 * and redoing actions.
 * @authors Yousef Yassin, Dana El Sherif
 */

const UndoRedoButtons = () => {
  const { undoCanvasHistory, redoCanvasHistory } = useCanvasElementStore([
    'undoCanvasHistory',
    'redoCanvasHistory',
  ]);

  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);

  const undo = () => {
    undoCanvasHistory();
    setWebsocketAction('undo', 'undoCanvasHistory');
  };

  const redo = () => {
    redoCanvasHistory();
    setWebsocketAction('redo', 'redoCanvasHistory');
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
        disabled={historyIndex <= 0}
        onClick={undo}
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
        disabled={historyIndex >= history.length - 1}
        onClick={redo}
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
