import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import { useAppStore } from '@/stores/AppStore';
import { colourType } from '@/types';
import { capitalize } from '@/lib/misc';
import IconButton from './IconButton';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';

const getCircleStyle = (toolName: colourType): React.CSSProperties => {
  switch (toolName) {
    case 'redCircle':
      return {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'red',
      };
    case 'greenCircle':
      return {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'green',
      };
    case 'blueCircle':
      return {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'blue',
      };
    case 'orangeCircle':
      return {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'orange',
      };
    case 'blackCircle':
      return {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'black',
      };
    default:
      return {};
  }
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
}: {
  tool: colourType;
  active: boolean;
  children?: React.ReactNode;
}) => {
  const { setColourTool } = useAppStore(['setColourTool']);
  const {
    editCanvasElement,
    selectedElementId,
    //fillColors,
    types,
    strokeColors,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    // freehandPoints,
    p1,
    p2,
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
const ToolGroup = ({
  tools,
  selectedTool,
}: {
  tools: colourType[];
  selectedTool: colourType;
}) => (
  <div className="flex">
    {tools.map((toolName) => (
      <div key={`CustomToolbar-${toolName}`} className="relative">
        <ToolButton tool={toolName} active={selectedTool === toolName}>
          <div style={getCircleStyle(toolName)}></div>
        </ToolButton>
      </div>
    ))}
  </div>
);

/**
 * The toolbar that is displayed on the canvas.
 */
const CustomToolbar = () => {
  const { colourTool } = useAppStore(['colourTool']);
  return (
    <Toolbar.Root className="p-[0.3rem] gap-[0.3rem] min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] mt-40 absolute ml-3">
      <h2 className="text-sm font-semibold mb-2">Color</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <ToolGroup
        tools={
          [
            'redCircle',
            'greenCircle',
            'blueCircle',
            'orangeCircle',
            'blackCircle',
          ] as colourType[]
        }
        selectedTool={colourTool}
      />
    </Toolbar.Root>
  );
};

export default CustomToolbar;
