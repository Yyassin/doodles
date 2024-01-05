import React, { ButtonHTMLAttributes } from 'react';
import CanvasTooltip from './CanvasTooltip';

/**
 * Defines a generic set of canvas
 * buttons to be placed on-top of the canvas view.
 * @author Yousef Yassin
 */

const DEFAULT_CLASSNAME =
  'p-[0.75rem] rounded-md items-center justify-center outline-none hover:bg-indigo-100 shadow-[0_3px_10px_rgb(0,0,0,0.2)]';

const BaseCanvasButton =
  (defaultClassname = DEFAULT_CLASSNAME) =>
  // eslint-disable-next-line react/display-name
  ({
    children,
    onClick,
    style,
    disabled,
    className,
    tooltip,
    ...rest
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    tooltip: { content: string; side: 'top' | 'bottom'; sideOffset: number };
  }) => {
    return (
      <CanvasTooltip
        className="radix-themes-custom-fonts"
        content={tooltip.content}
        side={tooltip.side}
        sideOffset={tooltip.sideOffset}
      >
        <button
          className={`${defaultClassname} ${className}`}
          onClick={onClick}
          style={style}
          disabled={disabled}
          {...rest}
        >
          {children}
        </button>
      </CanvasTooltip>
    );
  };

// An island canvas button with shadow.
const CanvasButton = BaseCanvasButton();
// These are inside a canvas island (that already has shadow).
const CanvasFlatButton = BaseCanvasButton(
  'p-[0.75rem] items-center justify-center outline-none enabled:hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed	',
);

export { CanvasButton, CanvasFlatButton };
