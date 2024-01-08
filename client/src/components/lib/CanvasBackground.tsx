import React from 'react';
import { useAppStore } from '@/stores/AppStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

/**
 * This file defines the CanvasColorToolGroup component, which allows the user to select
 * a background color for the canvas. The available colors are defined in the
 * `canvasColourTypes` array. The `strokeColorMap` and `mapStrokeColour` objects map these
 * colors to their corresponding CSS classes and color values respectively.
 * @author Eebro
 */

export const canvasColourTypes = [
  'whiteCanvas',
  'greenCanvas',
  'blueCanvas',
  'orangeCanvas',
] as const;
export type canvasColourType = (typeof canvasColourTypes)[number];

const strokeColorMap: Record<string, string> = {
  whiteCanvas: 'bg-white border-gray-300',
  greenCanvas: 'bg-green-200',
  blueCanvas: 'bg-blue-200',
  orangeCanvas: 'bg-orange-200',
};

const mapStrokeColour = {
  whiteCanvas: '#FFFFFF',
  greenCanvas: '#D5F5E3',
  blueCanvas: '#D6EAF8',
  orangeCanvas: '#FAE5D3',
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const CanvasColorToolGroup = ({
  colorList,
}: {
  colorList: canvasColourType[];
}) => {
  const { setCanvasBackground, canvasColor } = useAppStore([
    'setCanvasBackground',
    'canvasColor',
  ]);

  const handleColorSelection = (color: canvasColourType) => {
    setCanvasBackground(mapStrokeColour[color]);
    console.log('color', color);
  };

  return (
    <DropdownMenu.Item className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9">
      {colorList.map((color) => (
        <button
          className={
            'w-5 h-5 mr-3 rounded-full hover:border-gray-900 border-2 ' +
            strokeColorMap[color] +
            ' ' +
            (canvasColor === mapStrokeColour[color]
              ? 'border-gray-900'
              : 'border-gray-500')
          }
          onClick={() => handleColorSelection(color)}
          key={color}
        ></button>
      ))}
    </DropdownMenu.Item>
  );
};
export default CanvasColorToolGroup;
