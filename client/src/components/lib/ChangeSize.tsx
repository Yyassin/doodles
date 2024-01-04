import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';

/**
 * This file defines the ChangeSize component, which allows the user to change
 * the size of their text element.
 * @author Dana
 */
export const sizes = ['14', '24', '30', '40', '60'] as const;
export type size = (typeof sizes)[number];

const mapColour = {
  14: 14,
  24: 24,
  30: 30,
  40: 40,
  60: 60,
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
            <div className={'w-5 h-5 rounded-full ' + mapColour[toolName]}>
              {mapColour[toolName]}
            </div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};

export default SizeOptions;
