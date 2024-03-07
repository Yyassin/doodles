import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SaveOpenDropDownMenu } from '@/components/lib/SaveOpenDropDownMenu';
import { ExportingDropDownMenu } from '@/components/lib/ExportingDropDownMenu';
import { ResetCanvasDropDownMenu } from '@/components/lib/ResetCanvasDropDownMenu';
import {
  Pencil2Icon,
  InfoCircledIcon,
  Share1Icon,
  BlendingModeIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import CanvasColorToolGroup, { canvasColourTypes } from './CanvasBackground';
import { Button } from '../ui/button';

/**
 * Creates a DropDownMenu for Canvas
 * @author Dana El Sherif, Abdalla Abdelhadi, Zakariyya Almalki
 */

/**
 * @returns A DropDownMenu icon
 */
const DropDownIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 1C15.2044 1 14.4413 1.31607 13.8787 1.87868C13.3161 2.44129 13 3.20435 13 4V16C13 16.7956 13.3161 17.5587 13.8787 18.1213C14.4413 18.6839 15.2044 19 16 19C16.7956 19 17.5587 18.6839 18.1213 18.1213C18.6839 17.5587 19 16.7956 19 16C19 15.2044 18.6839 14.4413 18.1213 13.8787C17.5587 13.3161 16.7956 13 16 13H4C3.20435 13 2.44129 13.3161 1.87868 13.8787C1.31607 14.4413 1 15.2044 1 16C1 16.7956 1.31607 17.5587 1.87868 18.1213C2.44129 18.6839 3.20435 19 4 19C4.79565 19 5.55871 18.6839 6.12132 18.1213C6.68393 17.5587 7 16.7956 7 16V4C7 3.20435 6.68393 2.44129 6.12132 1.87868C5.55871 1.31607 4.79565 1 4 1C3.20435 1 2.44129 1.31607 1.87868 1.87868C1.31607 2.44129 1 3.20435 1 4C1 4.79565 1.31607 5.55871 1.87868 6.12132C2.44129 6.68393 3.20435 7 4 7H16C16.7956 7 17.5587 6.68393 18.1213 6.12132C18.6839 5.55871 19 4.79565 19 4C19 3.20435 18.6839 2.44129 18.1213 1.87868C17.5587 1.31607 16.7956 1 16 1Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Defines a DropDownMenu for the canvas with options to save, open, export, reset, and change the canvas background.
 * @returns The DropDownMenu component
 */
const DropDownMenu = ({
  viewportRef,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isPubDialogOpen,
  setIsPubDialogOpen,
}: {
  viewportRef: React.RefObject<HTMLDivElement>;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (value: boolean) => void;
  isPubDialogOpen: boolean;
  setIsPubDialogOpen: (value: boolean) => void;
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
    setIsEditDialogOpen(!isEditDialogOpen);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          className="border-solid border-2 border-indigo-300 hover:border-indigo-400 stroke-indigo-300 hover:stroke-indigo-400 px-2 py-2 z-10"
          style={{
            position: 'absolute',
            right: '1rem',
            bottom: '1rem',
          }}
        >
          <DropDownIcon />
        </Button>
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
            onClick={async () => {
              setIsPubDialogOpen(!isPubDialogOpen);
            }}
          >
            <RocketIcon /> Publish as Template
          </DropdownMenu.Item>
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
