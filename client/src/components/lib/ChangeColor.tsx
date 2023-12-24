import React, { useState } from 'react';
import { capitalize } from '@/lib/misc';
import IconButton from './IconButton';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';

/** Customizability Toolbar */
const colourTypes = [
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
  setColourTool,
}: {
  tool: colourType;
  active: boolean;
  children?: React.ReactNode;
  setColourTool: React.Dispatch<colourType>;
}) => {
  const {
    editCanvasElement,
    selectedElementId,
    types,
    strokeColors,
    bowings,
    roughnesses,
    strokeWidths,
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
    setColourTool(tool);
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
        fill: mapColour[tool],
        bowing: bowings[selectedElementId],
        roughness: roughnesses[selectedElementId],
        strokeWidth: strokeWidths[selectedElementId],
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
const ToolGroup = ({ tools }: { tools: colourType[] }) => {
  const { fillColors, selectedElementId } = useCanvasElementStore([
    'fillColors',
    'selectedElementId',
  ]);
  const [colourTool, setColourTool] = useState(fillColors[selectedElementId]); //realistically it should be what the current color is

  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            tool={toolName}
            active={colourTool === mapColour[toolName]}
            setColourTool={setColourTool as React.Dispatch<colourType>}
          >
            <div className={'w-5 h-5 rounded-full ' + colorMap[toolName]}></div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default ToolGroup;
