import { useAppStore } from '@/stores/AppStore';
import { Tooltip } from '@radix-ui/themes';
import { TooltipProps } from '@radix-ui/themes/dist/cjs/components/tooltip';
import React, { useEffect, useState } from 'react';

/**
 * Extension of the Radix UI tooltip that is compatible
 * wtih the full screen canvas. The only difference is that
 * we manually extract the viewport and set that as the tooltip's
 * portal container when we're in fullscreen mode so that tooltips
 * still work.
 * @author Yousef Yassin
 */

const CanvasTooltip = ({
  children,
  ...rest
}: TooltipProps & React.RefAttributes<HTMLDivElement>) => {
  const { isFullscreen } = useAppStore(['isFullscreen']);
  const [viewportRef, setViewportRef] = useState<HTMLElement>();

  useEffect(() => {
    // Not a good practice but it would be too tedious to pass it
    // in everytime we wanted to use a tooltip.
    const maybeViewportRef = document.getElementById('Viewport');
    if (maybeViewportRef === null) return;
    setViewportRef(maybeViewportRef);
  }, []);

  return (
    <Tooltip
      className="radix-themes-custom-fonts"
      // In fullscreen mode, set the viewport as the portal container
      // because the default root div will be hidden
      container={isFullscreen ? viewportRef : undefined}
      {...rest}
    >
      {children}
    </Tooltip>
  );
};

export default CanvasTooltip;
