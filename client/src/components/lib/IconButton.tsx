import * as Toolbar from '@radix-ui/react-toolbar';
import { Tooltip } from '@radix-ui/themes';
import React from 'react';

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
}: {
  children?: React.ReactNode;
  active?: boolean;
  label: string;
  onClick: (label: string) => void;
}) => {
  return (
    <Tooltip
      className="radix-themes-custom-fonts"
      content={label}
      side="top"
      sideOffset={5}
    >
      <Toolbar.Button
        className={`p-[0.75rem] rounded-md items-center justify-center outline-none hover:bg-indigo-100 ${
          active ? 'bg-indigo-200' : ''
        }`}
        value="bold"
        aria-label="Bold"
        onClick={() => onClick(label)}
      >
        {children}
      </Toolbar.Button>
    </Tooltip>
  );
};

export default IconButton;
