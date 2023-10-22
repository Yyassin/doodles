import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';
import { CanvasFlatButton } from './CanvasButton';

/**
 * Defines a set out buttons for zooming in and
 * out of the canvas.
 * @author Yousef Yassin
 */

const ZoomButtons = () => {
  // TODO: Should be in state at one point
  const [zoom, setZoom] = useState(100);

  return (
    <div
      className="flex gap-[0.3rem] w-full min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      style={{
        width: 'fit-content',
      }}
    >
      <CanvasFlatButton
        className="rounded-l-md"
        onClick={() => setZoom(Math.max(zoom - 1, 10))}
        tooltip={{
          content: 'Zoom out',
          side: 'top',
          sideOffset: 5,
        }}
      >
        <MinusIcon />
      </CanvasFlatButton>
      <div className="p-[0.5rem] flex items-center justify-center outline-none text-sm min-w-[3rem] max-w-[3rem]">
        <p>{`${zoom}%`}</p>
      </div>
      <CanvasFlatButton
        className="rounded-r-md"
        onClick={() => () => setZoom(Math.min(zoom + 1, 2000))}
        tooltip={{
          content: 'Zoom in',
          side: 'top',
          sideOffset: 5,
        }}
      >
        <PlusIcon />
      </CanvasFlatButton>
    </div>
  );
};

export default ZoomButtons;
