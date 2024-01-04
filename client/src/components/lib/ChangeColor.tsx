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
export const colourTypes = [
  'redCircle',
  'greenCircle',
  'blueCircle',
  'orangeCircle',
  'blackCircle',
] as const;
export type colourType = (typeof colourTypes)[number];

const colorMap: Record<string, string> = {
  redCircle: 'bg-red-500',
  greenCircle: 'bg-green-500',
  blueCircle: 'bg-blue-500',
  orangeCircle: 'bg-orange-500',
  blackCircle: 'bg-black',
};

const mapColour = {
  redCircle: '#FF0000',
  greenCircle: '#008000',
  blueCircle: '#0000FF',
  orangeCircle: '#FFA500',
  blackCircle: '#000000',
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const ToolGroup = ({ tools }: { tools: colourType[] }) => {
  const { fillColors, selectedElementIds } = useCanvasElementStore([
    'fillColors',
    'selectedElementIds',
  ]);
  console.log(fillColors[selectedElementIds[0]]);
  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ fillColor: mapColour[toolName] }}
            label={toolName}
            active={fillColors[selectedElementIds[0]] === mapColour[toolName]}
          >
            <div className={'w-5 h-5 rounded-full ' + colorMap[toolName]}></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default ToolGroup;
