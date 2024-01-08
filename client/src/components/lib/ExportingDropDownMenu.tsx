import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Share2Icon } from '@radix-ui/react-icons';
import {
  handlePDFExport,
  handlePNGExport,
  renderElementsOnOffscreenCanvas,
} from '@/lib/export';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useAppStore } from '@/stores/AppStore';

/**
 * Provides Exporting as PDF and PNG files buttons and functionality in DropDownMenu
 * @author Dana El Sherif
 */

export const ExportingDropDownMenu = () => {
  const { canvasColor } = useAppStore(['canvasColor']);
  const {
    allIds,
    p1,
    p2,
    types,
    freehandPoints,
    freehandBounds,
    textStrings,
    fontFamilies,
    fillColors,
    fontSizes,
    fileIds,
    isImagePlaceds,
    angles,
    roughElements,
    opacities,
    strokeColors,
    strokeWidths,
  } = useCanvasElementStore([
    'allIds',
    'p1',
    'p2',
    'types',
    'freehandPoints',
    'freehandBounds',
    'textStrings',
    'fontFamilies',
    'fontSizes',
    'fillColors',
    'fileIds',
    'isImagePlaceds',
    'angles',
    'roughElements',
    'opacities',
    'strokeColors',
    'strokeWidths',
  ]);

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
              onClick={() => {
                const canvas = renderElementsOnOffscreenCanvas(
                  allIds,
                  {
                    p1,
                    p2,
                    angles,
                    types,
                    freehandPoints,
                    freehandBounds,
                    textStrings,
                    fontFamilies,
                    fontSizes,
                    fillColors,
                    isImagePlaceds,
                    fileIds,
                    roughElements,
                    opacities,
                    strokeColors,
                    strokeWidths,
                  },
                  {
                    margin: 20,
                    canvasColor,
                  },
                );
                canvas && handlePDFExport(canvas.toDataURL('image/png'));
              }}
            >
              Export as PDF
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="group w-full text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
              onClick={() => {
                const canvas = renderElementsOnOffscreenCanvas(
                  allIds,
                  {
                    p1,
                    p2,
                    angles,
                    types,
                    freehandPoints,
                    freehandBounds,
                    textStrings,
                    fillColors,
                    fontFamilies,
                    fontSizes,
                    isImagePlaceds,
                    fileIds,
                    roughElements,
                    opacities,
                    strokeColors,
                    strokeWidths,
                  },
                  {
                    margin: 20,
                    canvasColor,
                  },
                );
                canvas && handlePNGExport(canvas.toDataURL('image/png'));
              }}
            >
              Export as PNG
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
    </>
  );
};
