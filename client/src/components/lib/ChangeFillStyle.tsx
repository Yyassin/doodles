import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';
import { CanvasElementFillStyle } from '@/types';

/**
 * This file defines the ChangeFillStyle component, which allows the user to select
 * a fill style for the canvas elements. The available fill styles are defined in the
 * `fillStyleMap` and `mapFillStyle` objects, which map these styles to their
 * corresponding CSS classes and fill style values respectively.
 * @author Eebro
 */

const fillStyleMap: Record<string, string> = {
  none: 'bg-red-500',
  hachure: 'bg-red-500',
  solid: 'bg-green-300',
  zigzag: 'bg-blue-300',
  ['cross-hatch']: 'bg-orange-500',
  dots: 'bg-black',
  dashed: 'bg-blue-500',
  ['zigzag-line']: 'bg-blue-500',
};

const mapFillStyle = {
  none: 'none',
  hachure: 'hachure',
  solid: 'solid',
  zigzag: 'zigzag',
  ['cross-hatch']: 'cross-hatch',
  dots: 'dots',
  dashed: 'dashed',
  ['zigzag-line']: 'zigzag-line',
} as const;

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const FillStyleToolGroup = ({ tools }: { tools: CanvasElementFillStyle[] }) => {
  const { fillStyles, selectedElementIds } = useCanvasElementStore([
    'fillStyles',
    'selectedElementIds',
  ]);

  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ fillStyle: mapFillStyle[toolName] }}
            label={toolName}
            active={
              fillStyles[selectedElementIds[0]] === mapFillStyle[toolName]
            }
          >
            <div
              className={'w-5 h-5 rounded-full ' + fillStyleMap[toolName]}
            ></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default FillStyleToolGroup;
