import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';

/**
 * This file defines the ChangeColor component, which allows the user to select
 * a color for the canvas elements. The available colors are defined in the
 * `colourTypes` array, and the `colorMap` object maps these types to their
 * corresponding CSS classes.
 * @author Eebro
 */

/** Customizability Toolbar */
export const sizes = [
  'redCircle',
  'greenCircle',
  'blueCircle',
  'orangeCircle',
  'blackCircle',
] as const;
export type size = (typeof sizes)[number];

const colorMap: Record<string, string> = {
  redCircle: 'bg-red-500',
  greenCircle: 'bg-green-500',
  blueCircle: 'bg-blue-500',
  orangeCircle: 'bg-orange-500',
  blackCircle: 'bg-black',
};

const mapColour = {
  redCircle: '10',
  greenCircle: '14',
  blueCircle: '24',
  orangeCircle: '30',
  blackCircle: '40',
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const SizeOptions = ({ tools }: { tools: size[] }) => {
  const { textSizes, selectedElementIds } = useCanvasElementStore([
    'textSizes',
    'selectedElementIds',
  ]);
  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ textSize: mapColour[toolName] }}
            label={toolName}
            active={textSizes[selectedElementIds[0]] === mapColour[toolName]}
          >
            <div className={'w-5 h-5 rounded-full ' + colorMap[toolName]}></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default SizeOptions;
