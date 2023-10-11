import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  HamburgerMenuIcon,
  EnvelopeOpenIcon,
  Pencil2Icon,
  TrashIcon,
  Share2Icon,
  DownloadIcon,
  InfoCircledIcon,
  Share1Icon,
} from '@radix-ui/react-icons';

const DropDownMenu = () => {
  //Handle button functionailities
  const handleOpen = () => {
    console.log('Opening');
  };
  const handleExport = () => {
    console.log('Exporting');
  };
  const handleSave = () => {
    console.log('Saving');
  };
  const handleInfo = () => {
    console.log('Displaying Info');
  };
  const handleLive = () => {
    console.log('Live Collab');
  };
  const handleEditCanvas = () => {
    console.log('Editing Canvas');
  };
  const handleReset = () => {
    console.log('Reseting');
  };

  return (
    <div style={{ position: 'relative' }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="rounded-full w-[35px] h-[35px] inline-flex items-center justify-center text-violet11 bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
            style={{ position: 'absolute', top: -5, right: 0 }}
          >
            <HamburgerMenuIcon />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
            sideOffset={9}
          >
            <DropdownMenu.Item
              className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
              onClick={handleOpen}
            >
              <EnvelopeOpenIcon /> Open
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
            <DropdownMenu.Item
              className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
              onClick={handleSave}
            >
              <DownloadIcon /> Save
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
            <DropdownMenu.Item
              className="group text-[13px] indent-[10px] rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
              onClick={handleExport}
            >
              <Share2Icon /> Export
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
            <DropdownMenu.Item
              className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none  data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
              onClick={handleLive}
            >
              <Share1Icon /> Live Collaboration
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
            <DropdownMenu.Item
              className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
              onClick={handleInfo}
            >
              <InfoCircledIcon /> Info
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
            <DropdownMenu.Item
              className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
              onClick={handleReset}
            >
              <TrashIcon /> Reset Canvas
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
            <DropdownMenu.Item
              className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
              onClick={handleEditCanvas}
            >
              <Pencil2Icon /> Edit Canvas
            </DropdownMenu.Item>

            <DropdownMenu.Arrow className="fill-white" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

export default DropDownMenu;
