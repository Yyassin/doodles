import React, { ReactNode } from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import {
  TextIcon,
  Pencil1Icon,
  HandIcon,
  SquareIcon,
  MinusIcon,
  ImageIcon,
  CircleIcon,
  EraserIcon,
  CursorArrowIcon,
} from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import { AppTool, AppTools, IMAGE_MIME_TYPES } from '@/types';
import { capitalize, setCursor } from '@/lib/misc';
import IconButton from './IconButton';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { generateRandId } from '@/lib/bytes';
import { fileOpen } from '@/lib/fs';
import { injectImageElement } from '@/lib/image';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { IS_ELECTRON_INSTANCE } from '@/constants';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';

/**
 * This is the toolbar that is displayed on the canvas.
 * The toolbar contains various buttons for
 * many tool modes (e.g. erase, insert text, shapes)
 * @authors Dana El Sherif, Yousef Yassin
 */

/* Map of tools to their icons */
const toolIcons: Record<AppTool, ReactNode> = {
  select: <CursorArrowIcon />,
  pan: <HandIcon />,
  text: <TextIcon />,
  freehand: <Pencil1Icon />,
  rectangle: <SquareIcon />,
  circle: <CircleIcon />,
  line: <MinusIcon />,
  image: <ImageIcon />,
  erase: <EraserIcon />,
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
  tool: AppTool;
  active: boolean;
  children?: React.ReactNode;
}) => {
  const { setTool, isTransparent } = useAppStore(['setTool', 'isTransparent']);
  const {
    removeCanvasElements,
    setSelectedElements,
    pushCanvasHistory,
    setPendingImageElement,
    selectedElementIds,
    addCanvasShape,
    editCanvasElement,
  } = useCanvasElementStore([
    'removeCanvasElements',
    'setSelectedElements',
    'pushCanvasHistory',
    'setPendingImageElement',
    'selectedElementIds',
    'addCanvasShape',
    'editCanvasElement',
  ]);

  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);

  // Temporary. For now we erase the selected element. In the
  // future we can add a context menu with delete and make erase
  // a drag operation.
  const isErase = tool === 'erase';
  const onClick = isErase
    ? () => {
        const ids = selectedElementIds;
        setSelectedElements([]);
        removeCanvasElements(ids);
        pushCanvasHistory();
        setWebsocketAction(ids, 'removeCanvasElements');
        setCursor('');
      }
    : tool === 'image'
    ? async () => {
        // Prompt the user to select image from file explorer
        try {
          const imageFile = await fileOpen({
            description: 'Image',
            extensions: Object.keys(
              IMAGE_MIME_TYPES,
            ) as (keyof typeof IMAGE_MIME_TYPES)[],
          });
          // Create a proxy element
          const id = generateRandId();
          const placeholderElement = createElement(id, 0, 0, 0, 0, 'image');
          setPendingImageElement(id);
          // Inject the image into the proxy
          await injectImageElement(
            placeholderElement,
            imageFile,
            addCanvasShape,
            editCanvasElement,
            true,
          );
          // And let the user place the image
          setTool('image');
        } catch (e: unknown) {
          setCursor('');
        }
      }
    : () => {
        setTool(tool);
        setCursor('');
      };

  return (
    <IconButton
      label={capitalize(tool)}
      active={active}
      onClick={onClick}
      disabled={tool === 'pan' && isTransparent}
    >
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
  const { tool, isTransparent } = useAppStore(['tool', 'isTransparent']);
  const { boardMeta } = useCanvasBoardStore(['boardMeta']);
  const allowEdit = boardMeta.permission !== 'view';
  return (
    <Toolbar.Root
      className="flex p-[0.3rem] gap-[0.3rem] w-full min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] z-10"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        // centering
        margin: 'auto',
        top: `calc(1rem + ${
          IS_ELECTRON_INSTANCE && isTransparent ? '30px' : '0px'
        })`,
        width: 'fit-content',
      }}
    >
      <ToolGroup
        tools={(allowEdit ? ['select', 'pan'] : ['pan']) as AppTool[]}
        selectedTool={tool}
      />
      {allowEdit && (
        <React.Fragment>
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <ToolGroup
            tools={
              [
                'text',
                'freehand',
                'rectangle',
                'circle',
                'line',
                'image',
                'erase',
              ] as AppTool[]
            }
            selectedTool={tool}
          />
        </React.Fragment>
      )}
    </Toolbar.Root>
  );
};

export default ToolBar;
