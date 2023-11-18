import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { TrashIcon } from '@radix-ui/react-icons';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';

/**
 * Provides Reset Canvas functionality in DropDownMenu
 *
 * @author Dana El Sherif
 */

export const ResetCanvasDropDownMenu = () => {
  const { resetCanvas } = useCanvasElementStore(['resetCanvas']);

  const handleReset = () => {
    console.log('reset');
    resetCanvas();
  };
  return (
    <>
      <DropdownMenu.Sub>
        <DropdownMenu.Item
          className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
          onClick={handleReset}
        >
          <TrashIcon /> Reset Canvas
        </DropdownMenu.Item>
      </DropdownMenu.Sub>
    </>
  );
};
