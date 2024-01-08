import { EnterFullScreenIcon, ExitFullScreenIcon } from '@radix-ui/react-icons';
import React from 'react';
import { CanvasButton } from './CanvasButton';
import { useAppStore } from '@/stores/AppStore';
import { toggleFullscreen } from '@/lib/toggleFullscreen';

/**
 * Defines a button to toggle the
 * fullscreen mode of the canvas.
 * @author Yousef Yassin
 */

const FullScreenButton = ({
  viewportRef,
}: {
  viewportRef: React.RefObject<HTMLDivElement>;
}) => {
  const { isFullscreen, setIsFullscreen } = useAppStore([
    'isFullscreen',
    'setIsFullscreen',
  ]);

  return (
    <CanvasButton
      onClick={() => {
        if (viewportRef.current === null) return;
        setIsFullscreen(!isFullscreen);
        toggleFullscreen(viewportRef.current);
      }}
      className="bg-white"
      tooltip={{
        content: isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
        side: 'top',
        sideOffset: 5,
      }}
    >
      {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
    </CanvasButton>
  );
};

export default FullScreenButton;
