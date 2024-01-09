import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';

/**
 * This file defines the ChangeThickness component, which allows the user to adjust
 * the thickness of the stroke for the selected canvas element. The available stroke
 * thicknesses are defined in the `strokeTypes` array. Changes to the stroke thickness
 * are made by calling the appropriate function from the CanvasElementStore.
 * @author Eebro
 */

/** Customizability Toolbar */
export const strokeTypes = ['thin', 'bold', 'extraBold'] as const;
export type strokeType = (typeof strokeTypes)[number];

const strokeMap: Record<string, string> = {
  thin: 'border-t border-gray-700',
  bold: 'border-t-4 border-gray-700',
  extraBold: 'border-t-8 border-gray-700',
};

const mapStroke = {
  thin: 1.25,
  bold: 3,
  extraBold: 7,
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const StrokeToolGroup = ({ tools }: { tools: strokeType[] }) => {
  const { strokeWidths, selectedElementIds, toolOptions } =
    useCanvasElementStore([
      'strokeWidths',
      'selectedElementIds',
      'toolOptions',
    ]);
  const interestValue = selectedElementIds[0]
    ? strokeWidths[selectedElementIds[0]]
    : toolOptions.strokeWidth;
  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ strokeWidth: mapStroke[toolName] }}
            label={toolName}
            active={interestValue === mapStroke[toolName]}
          >
            <div className={'w-5 h-5 square-full ' + strokeMap[toolName]}></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default StrokeToolGroup;
