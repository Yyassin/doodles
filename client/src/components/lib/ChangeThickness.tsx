import React, { useState } from 'react';
import { capitalize } from '@/lib/misc';
import IconButton from './IconButton';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';

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
  extraBold: 5,
};

/**
 * Defines a button for a toolbar tool. Contains
 * a representative icon (defined above) and
 * a state hook to set the selected tool. The currently
 * active tool is highlighted.
 * @param tool The tool the button corresponds to.
 * @param active True if this tool is currently selected, false otherwise.
 * @param children Children React nodes, if any.
 */
const ToolButton = ({
  tool,
  active,
  children,
  setStrokeTool,
}: {
  tool: strokeType;
  active: boolean;
  children?: React.ReactNode;
  setStrokeTool: React.Dispatch<strokeType>;
}) => {
  const {
    editCanvasElement,
    selectedElementId,
    fillColors,
    types,
    strokeColors,
    bowings,
    roughnesses,
    //strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    p1,
    p2,
    textStrings,
  } = useCanvasElementStore([
    'editCanvasElement',
    'selectedElementId',
    'fillColors',
    'types',
    'strokeColors',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'freehandPoints',
    'p1',
    'p2',
    'textStrings',
  ]);

  const onClick = () => {
    setStrokeTool(tool);
    const newElement = createElement(
      selectedElementId,
      p1[selectedElementId].x,
      p1[selectedElementId].y,
      p2[selectedElementId].x,
      p2[selectedElementId].y,
      types[selectedElementId],
      undefined,
      {
        stroke: strokeColors[selectedElementId],
        fill: fillColors[selectedElementId],
        bowing: bowings[selectedElementId],
        roughness: roughnesses[selectedElementId],
        strokeWidth: mapStroke[tool],
        fillStyle: fillStyles[selectedElementId],
        strokeLineDash: strokeLineDashes[selectedElementId],
        opacity: opacities[selectedElementId],
        text: textStrings[selectedElementId],
      },
    );
    editCanvasElement(selectedElementId, newElement);
  };

  return (
    <IconButton label={capitalize(tool)} active={active} onClick={onClick}>
      {children}
    </IconButton>
  );
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const StrokeToolGroup = ({ tools }: { tools: strokeType[] }) => {
  const { strokeWidths, selectedElementId } = useCanvasElementStore([
    'strokeWidths',
    'selectedElementId',
  ]);
  const [strokeTool, setStrokeTool] = useState(strokeWidths[selectedElementId]);

  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            tool={toolName}
            active={strokeTool === mapStroke[toolName]}
            setStrokeTool={setStrokeTool as React.Dispatch<strokeType>}
          >
            <div className={'w-5 h-5 square-full ' + strokeMap[toolName]}></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default StrokeToolGroup;
