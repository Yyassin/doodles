import React from 'react';
import { Item } from '@radix-ui/react-context-menu';

/**
 * Defines generic context menu single-item, with styling.
 * @author Yousef Yassin
 */

const ContextMenuItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Item
    className="group text-[13px] leading-none text-red-700 cursor-grab rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
    onClick={onClick}
  >
    {children}
  </Item>
);

export default ContextMenuItem;
