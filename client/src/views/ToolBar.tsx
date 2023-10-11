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

/**
 * This is the toolbar that is displayed on the canvas.
 * The toolbar contains various buttons for
 * many elements (e.g. erase, insert text, shapes)
 * @author Dana El Sherif
 */

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
      className="flex p-[10px] w-full min-w-max rounded-md bg-white shadow-[0_2px_10px] shadow-blackA4"
      style={{ position: 'absolute', right: 400, top: -5, width: 8 }}
    >
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[px] items-center justify-center focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleSelect}
      >
        <CursorArrowIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center  focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handlePan}
      >
        <HandIcon />
      </Toolbar.Button>
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[10px]" />
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleText}
      >
        <TextIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleDraw}
      >
        <Pencil1Icon />
      </Toolbar.Button>
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleRectangle}
      >
        <SquareIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleLine}
      >
        <MinusIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleImage}
      >
        <ImageIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] items-center justify-center focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleErase}
      >
        <EraserIcon />
      </Toolbar.Button>
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[10px]" />
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px]  items-center justify-center  focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleZoomIn}
      >
        <ZoomInIcon />
      </Toolbar.Button>
      <Toolbar.Button
        className="px-[15px] text-violet11 bg-violet9 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px]  items-center justify-center  focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7 hover:bg-teal-500"
        onClick={handleZoomOut}
      >
        <ZoomOutIcon />
      </Toolbar.Button>
    </Toolbar.Root>
  );
};

export default ToolBar;
