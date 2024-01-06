import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SaveOpenDropDownMenu } from '@/components/lib/SaveOpenDropDownMenu';
import { ExportingDropDownMenu } from '@/components/lib/ExportingDropDownMenu';
import { ResetCanvasDropDownMenu } from '@/components/lib/ResetCanvasDropDownMenu';
import {
  HamburgerMenuIcon,
  Pencil2Icon,
  InfoCircledIcon,
  Share1Icon,
  BlendingModeIcon,
} from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import CanvasColorToolGroup, { canvasColourTypes } from './CanvasBackground';

/**
 * Creates a DropDownMenu for Canvas
 * @author Dana El Sherif
 */

const DropDownMenu = ({
  viewportRef,
}: {
  viewportRef: React.RefObject<HTMLDivElement>;
}) => {
  const { isFullscreen } = useAppStore(['isFullscreen']);
  //Handle button functionailities

  const handleInfo = () => {
    console.log('Displaying Info');
  };
  const handleLive = () => {
    console.log('Live Collab');
  };
  const handleEditCanvas = () => {
    console.log('Editing Canvas');
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded-md w-[25px] h-[25px] inline-flex items-center justify-center text-violet11 bg-white outline outline-offset-2 outline-indigo-400 hover:bg-violet3"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        >
          <HamburgerMenuIcon />
        </button>
      </DropdownMenu.Trigger>

      {/* In fullscreen mode the root div is hidden so we need to set the portal container to the viewport. */}
      <DropdownMenu.Portal
        container={isFullscreen ? viewportRef.current : undefined}
      >
        <DropdownMenu.Content
          className="min-w-[20px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
          side={'bottom'}
          sideOffset={5}
          align="end"
          alignOffset={0}
        >
          <SaveOpenDropDownMenu />
          <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
          <ExportingDropDownMenu />
          <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
          <DropdownMenu.Item
            className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none  data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
            onClick={handleLive}
          >
            <Share1Icon /> Live Collaboration
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
          <DropdownMenu.Item
            className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
            onClick={handleInfo}
          >
            <InfoCircledIcon /> Info
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
          <DropdownMenu.Item
            className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
            onClick={handleEditCanvas}
          >
            <Pencil2Icon /> Edit Canvas
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />

          <ResetCanvasDropDownMenu />
          <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />

          <DropdownMenu.Item
            className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
            disabled={true}
          >
            <BlendingModeIcon /> Canvas Background
          </DropdownMenu.Item>

          <CanvasColorToolGroup colorList={[...canvasColourTypes]} />

          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default DropDownMenu;
