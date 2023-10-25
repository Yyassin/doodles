import React, { ReactNode } from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import {
  TextIcon,
  Pencil1Icon,
  HandIcon,
  SquareIcon,
  MinusIcon,
  ImageIcon,
  EraserIcon,
  CursorArrowIcon,
} from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import { AppTool, AppTools } from '@/types';
import { capitalize } from '@/lib/misc';
import IconButton from './IconButton';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';

/* Map of tools to their icons */
const toolIcons: Record<AppTool, ReactNode> = {
  select: <CursorArrowIcon />,
  pan: <HandIcon />,
  text: <TextIcon />,
  freehand: <Pencil1Icon />,
  rectangle: <SquareIcon />,
  line: <MinusIcon />,
  image: <ImageIcon />,
  erase: <EraserIcon />,
};

/**
 * This is the toolbar that is displayed on the canvas.
 * The toolbar contains various buttons for
 * many tool modes (e.g. erase, insert text, shapes)
 * @authors Dana El Sherif, Yousef Yassin
 */

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
  tool: AppTool;
  active: boolean;
  children?: React.ReactNode;
}) => {
  const { setTool } = useAppStore(['setTool']);
  const { removeCanvasElement, setSelectedElement, selectedElementId } =
    useCanvasElementStore([
      'removeCanvasElement',
      'setSelectedElement',
      'selectedElementId',
    ]);

  // Temporary. For now we erase the selected element. In the
  // future we can add a context menu with delete and make erase
  // a drag operation.
  const isErase = tool === 'erase';
  const onClick = isErase
    ? () => {
        const id = selectedElementId;
        setSelectedElement('');
        removeCanvasElement(id);
      }
    : () => setTool(tool);

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
  tools: AppTool[];
  selectedTool: AppTool;
}) =>
  tools.map((toolName) => (
    <div key={`toolbar-${toolName}`} className="relative">
      <ToolButton tool={toolName} active={selectedTool === toolName}>
        {toolIcons[toolName]}
        <p
          className="absolute bottom-[0.05rem] right-[0.25rem] font-medium text-slate-400"
          style={{
            fontSize: '0.55rem',
          }}
        >
          {AppTools.indexOf(toolName) + 1}
        </p>
      </ToolButton>
    </div>
  ));

/**
 * The toolbar that is displayed on the canvas.
 */
const ToolBar = () => {
  const { tool } = useAppStore(['tool']);
  return (
    <Toolbar.Root
      className="flex p-[0.3rem] gap-[0.3rem] w-full min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        // centering
        margin: 'auto',
        top: '1rem',
        width: 'fit-content',
      }}
    >
      <ToolGroup tools={['select', 'pan'] as AppTool[]} selectedTool={tool} />
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <ToolGroup
        tools={
          [
            'text',
            'freehand',
            'rectangle',
            'line',
            'image',
            'erase',
          ] as AppTool[]
        }
        selectedTool={tool}
      />
    </Toolbar.Root>
  );
};

export default ToolBar;
