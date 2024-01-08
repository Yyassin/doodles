import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';

/**
 * This file defines the ChangeRoughness component, which allows the user to adjust
 * the roughness of the selected canvas element. The current roughness value is represented
 * by a slider that ranges from 1 to 100. Changes to the roughness are made by calling
 * the `setCustomizabilityDict` function from the CanvasElementStore.
 * @author Eebro
 */

/** Customizability Toolbar */
export const roughnessTypes = ['smooth', 'rough', 'extraRough'] as const;
export type roughnessType = (typeof roughnessTypes)[number];

const roughnessMap: Record<string, string> = {
  smooth: 'border-t border-gray-700',
  rough: 'border-t-2 border-gray-700',
  extraRough: 'border-t-4 border-gray-700',
};

const mapRoughness = {
  smooth: 0.01,
  rough: 1.5,
  extraRough: 3,
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const RoughnessToolGroup = ({ tools }: { tools: roughnessType[] }) => {
  const { roughnesses, selectedElementIds } = useCanvasElementStore([
    'roughnesses',
    'selectedElementIds',
  ]);
  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ roughness: mapRoughness[toolName] }}
            label={toolName}
            active={
              roughnesses[selectedElementIds[0]] === mapRoughness[toolName]
            }
          >
            <div
              className={'w-5 h-5 square-full ' + roughnessMap[toolName]}
            ></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default RoughnessToolGroup;
