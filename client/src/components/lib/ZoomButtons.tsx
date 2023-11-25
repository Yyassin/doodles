import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import React from 'react';
import { CanvasFlatButton } from './CanvasButton';
import { useAppStore } from '@/stores/AppStore';
import { clamp } from '@/lib/misc';
import { ZOOM } from '@/constants';

/**
 * Defines a set out buttons for zooming in and
 * out of the canvas.
 * @author Yousef Yassin
 */

const ZoomButtons = () => {
  const { setAppZoom, zoom } = useAppStore(['setAppZoom', 'zoom']);
  return (
    <div
      className="flex gap-[0.3rem] w-full min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      style={{
        width: 'fit-content',
      }}
    >
      <CanvasFlatButton
        className="rounded-l-md"
        onClick={() => setAppZoom(clamp(zoom - ZOOM.INC, ZOOM.MIN, ZOOM.MAX))}
        tooltip={{
          content: 'Zoom out',
          side: 'top',
          sideOffset: 5,
        }}
      >
        <MinusIcon />
      </CanvasFlatButton>
      <div className="p-[0.5rem] flex items-center justify-center outline-none text-sm min-w-[3rem] max-w-[3rem]">
        <p>{`${new Intl.NumberFormat('en-GB', { style: 'percent' }).format(
          zoom,
        )}`}</p>
      </div>
      <CanvasFlatButton
        className="rounded-r-md"
        onClick={() => setAppZoom(clamp(zoom + ZOOM.INC, ZOOM.MIN, ZOOM.MAX))}
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
