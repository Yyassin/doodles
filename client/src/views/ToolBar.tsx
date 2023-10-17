import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import {
  TextIcon,
  Pencil1Icon,
  HandIcon,
  ZoomInIcon,
  ZoomOutIcon,
  SquareIcon,
  MinusIcon,
  ImageIcon,
  EraserIcon,
  CursorArrowIcon,
} from '@radix-ui/react-icons';
import { IconButton, Tooltip } from '@radix-ui/themes';

/**
 * This is the toolbar that is displayed on the canvas.
 * The toolbar contains various buttons for
 * many elements (e.g. erase, insert text, shapes)
 * @author Dana El Sherif
 */

type CopyButtonProps = {
  children?: React.ReactNode;
  label: string;
};

const CopyButton = ({ children, label }: CopyButtonProps) => {
  return (
    <Tooltip
      className="radix-themes-custom-fonts"
      content={label}
      side="top"
      sideOffset={5}
    >
      <IconButton highContrast variant="ghost" size="4">
        {children}
      </IconButton>
    </Tooltip>
  );
};

const ToolBar = () => {
  //Button functionalities
  const handleSelect = () => {
    console.log('Selecting');
  };

  const handleErase = () => {
    console.log('Erasing');
  };

  const handleZoomIn = () => {
    console.log('Zooming In');
  };

  const handleZoomOut = () => {
    console.log('Zooming Out');
  };

  const handlePan = () => {
    console.log('Panning');
  };

  const handleText = () => {
    console.log('Insert Text');
  };

  const handleRectangle = () => {
    console.log('Rectangle');
  };

  const handleLine = () => {
    console.log('Line');
  };
  const handleDraw = () => {
    console.log('Drawing');
  };

  const handleImage = () => {
    console.log('Drawing');
  };

  return (
    <Toolbar.Root
      className="flex p-[8px] w-full min-w-max rounded-md bg-white shadow-[0_2px_10px] shadow-blackA4"
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
      <CopyButton label="Select">
        <CursorArrowIcon />
      </CopyButton>
      <CopyButton label="Pan">
        <HandIcon />
      </CopyButton>
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[10px]" />
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleText}
      >
        <TextIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleDraw}
      >
        <Pencil1Icon />
      </Toolbar.Button>
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleRectangle}
      >
        <SquareIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleLine}
      >
        <MinusIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleImage}
      >
        <ImageIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleErase}
      >
        <EraserIcon />
      </Toolbar.Button>
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[10px]" />
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px]  items-center justify-center  focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleZoomIn}
      >
        <ZoomInIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="p-[8px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px]  items-center justify-center  focus:relative focus:bg-teal-500 hover:bg-indigo-100"
        onClick={handleZoomOut}
      >
        <ZoomOutIcon />
      </Toolbar.Button>
    </Toolbar.Root>
  );
};

export default ToolBar;
