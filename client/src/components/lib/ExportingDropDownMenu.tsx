import jsPDF from 'jspdf';
import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Share2Icon } from '@radix-ui/react-icons';

/**
 * Provides Exporting as PDF and PNG files buttons and functionality in DropDownMenu
 *
 * @author Dana El Sherif
 */

/**
 * Downloads Canvas as PNG File
 */
const handlePNGExport = (dataURL: string) => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'canvas.png';
  link.click();
};

/**
 * Downloads Canvas as PDF File
 */
const handlePDFExport = (dataURL: string) => {
  const pdf = new jsPDF('portrait');
  pdf.addImage(dataURL, 'PNG', 15, 15, 190, 130);
  pdf.save('canvas.pdf');
};

export const ExportingDropDownMenu = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const dataURL = canvas.toDataURL('image/png');

  return (
    <>
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger className="group w-full text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200">
          <Share2Icon /> Export
        </DropdownMenu.SubTrigger>
        <DropdownMenu.Portal>
          <DropdownMenu.SubContent
            className="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
            sideOffset={2}
            alignOffset={-5}
          >
            <DropdownMenu.Item
              className="group w-full text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
              onClick={() => handlePDFExport(dataURL)}
            >
              Export as PDF
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="group w-full text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
              onClick={() => handlePNGExport(dataURL)}
            >
              Export as PNG
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
    </>
  );
};
