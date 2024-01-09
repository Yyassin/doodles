import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';

/**
 * This file defines the ChangeStrokeColor component, which allows the user to select
 * a stroke color for the selected canvas element. The available stroke colors are defined
 * in the `strokeColourTypes` array. Changes to the stroke color are made by calling
 * the appropriate function from the CanvasElementStore.
 * @author Eebro
 */

/** Customizability Toolbar */
export const strokeColourTypes = [
  'redCircle',
  'greenCircle',
  'blueCircle',
  'orangeCircle',
  'blackCircle',
] as const;
export type strokeColourType = (typeof strokeColourTypes)[number];

const strokeColorMap: Record<string, string> = {
  redCircle: 'bg-red-500',
  greenCircle: 'bg-green-500',
  blueCircle: 'bg-blue-500',
  orangeCircle: 'bg-orange-500',
  blackCircle: 'bg-black',
};

const mapStrokeColour = {
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
const StokeColorToolGroup = ({ tools }: { tools: strokeColourType[] }) => {
  const { strokeColors, selectedElementIds, toolOptions } =
    useCanvasElementStore([
      'strokeColors',
      'selectedElementIds',
      'toolOptions',
    ]);
  const interestValue = selectedElementIds[0]
    ? strokeColors[selectedElementIds[0]]
    : toolOptions.strokeColor;
  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ strokeColor: mapStrokeColour[toolName] }}
            label={toolName}
            active={interestValue === mapStrokeColour[toolName]}
          >
            <div
              className={'w-5 h-5 rounded-full ' + strokeColorMap[toolName]}
            ></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default StokeColorToolGroup;
