import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';

/** Customizability Toolbar */
const strokeTypes = ['thin', 'bold', 'extraBold'] as const;
export type strokeType = (typeof strokeTypes)[number];

const strokeMap: Record<string, string> = {
  thin: 'border-t border-gray-700',
  bold: 'border-t-2 border-gray-700',
  extraBold: 'border-t-4 border-gray-700',
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
  const { strokeWidths, selectedElementIds } = useCanvasElementStore([
    'strokeWidths',
    'selectedElementIds',
  ]);

  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ strokeWidth: mapStroke[toolName] }}
            active={strokeWidths[selectedElementIds[0]] === mapStroke[toolName]}
          >
            <div className={'w-5 h-5 square-full ' + strokeMap[toolName]}></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default StrokeToolGroup;
