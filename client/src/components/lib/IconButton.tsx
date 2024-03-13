import React from 'react';
import { CanvasFlatButton } from './CanvasButton';

/**
 * A button designed specifically for usage with a single icon.
 * Centers the icon and provides a tooltip with the provided text.
 * @authors Yousef Yassin
 */

const IconButton = ({
  children,
  label,
  active,
  onClick,
  disabled,
}: {
  children?: React.ReactNode;
  active?: boolean;
  label: string;
  onClick: (label: string) => void;
  disabled?: boolean;
}) => {
  return (
    <CanvasFlatButton
      disabled={disabled}
      className={`rounded-md ${
        active ? 'bg-indigo-200 hover:bg-indigo-200' : ''
      }`}
      tooltip={{ content: label, side: 'bottom', sideOffset: 5 }}
      value="bold"
      aria-label="Bold"
      onClick={() => onClick(label)}
    >
      {children}
    </CanvasFlatButton>
  );
};

export default IconButton;
