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

const mapsize = {
  14: 14,
  24: 24,
  30: 30,
  40: 40,
  60: 60,
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of text sizes.
 * @param tools The list of sizes
 * @param selectedTool The currently selected size, used
 * to highlight the selected tool.
 */
const SizeOptions = ({ tools }: { tools: size[] }) => {
  const { textSizes, selectedElementIds, toolOptions } = useCanvasElementStore([
    'textSizes',
    'selectedElementIds',
    'toolOptions',
  ]);
  const interestValue = selectedElementIds[0]
    ? textSizes[selectedElementIds[0]]
    : toolOptions.textSize;
  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ textSize: mapsize[toolName] }}
            label={toolName}
            active={interestValue === mapsize[toolName]}
          >
            <div className={'w-5 h-5 rounded-full ' + mapsize[toolName]}>
              {mapsize[toolName]}
            </div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};

export default SizeOptions;
