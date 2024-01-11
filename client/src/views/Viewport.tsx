import React, { useRef, useState } from 'react';
import Canvas from '@/components/lib/Canvas';
import DropDownMenu from '@/components/lib/DropDownMenu';
import ToolBar from '@/components/lib/ToolBar';
import { useAppStore } from '@/stores/AppStore';
import FullScreenButton from '@/components/lib/FullScreenButton';
import UndoRedoButtons from '@/components/lib/UndoRedoButtons';
import ZoomButtons from '@/components/lib/ZoomButtons';
import CustomToolbar from '@/components/lib/CustomizabilityToolbar';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ContextMenu from '@/components/lib/ContextMenu';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import ShareScreen from '@/components/lib/ShareScreen';
import ShareScreenButton from '@/components/lib/ShareScreenButton';
import TransparencyButton from '@/components/lib/TransparencyButton';
import { IS_ELECTRON_INSTANCE } from '@/constants';
import StableDiffusionSheet from '@/components/lib/StableDiffusion/StableDiffusionSheet';
import { getInitials, isDrawingTool } from '@/lib/misc';
import { ArrowLeftIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Users2Icon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CanvasTooltip from '@/components/lib/CanvasTooltip';
import ShareBoardDialog from '@/components/lib/ShareBoardDialog';

export interface User {
  username: string;
  email: string;
  initials: string;
  avatar: string;
  outlineColor?: string; // Add an optional 'outlineColor' property
}

const UserList = ({ users }: { users: User[] }) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleAvatarHover = (index: number) => {
    setFocusedIndex(index);
  };

  const handleAvatarLeave = () => {
    setFocusedIndex(null);
  };

  return (
    <div className="flex items-center">
      {users.map((user, index) => (
        <div
          key={index}
          className={`relative transition-transform transform ${
            focusedIndex !== null && focusedIndex !== index
              ? index > focusedIndex
                ? 'translate-x-6 -ml-3'
                : '-translate-x-6 -ml-3'
              : '-ml-3'
          } `}
        >
          <CanvasTooltip
            className="radix-themes-custom-fonts"
            content={user.username}
            side="bottom"
            sideOffset={5}
          >
            <Avatar
              className={`cursor-pointer ${
                focusedIndex === index ? 'transform scale-125' : ''
              } ${
                user.outlineColor ? `border-[0.2rem] ${user.outlineColor}` : ''
              }`}
              onMouseEnter={() => handleAvatarHover(index)}
              onMouseLeave={handleAvatarLeave}
            >
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </CanvasTooltip>
        </div>
      ))}
    </div>
  );
};

const username = 'Yousef Yassin';
const email = 'yousefyassin@cmail.carleton.ca';
const avatar = 'https://github.com/shadcn.png';
const users = [
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#0000ff]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#0f0f00]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#ff0000]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#ff0000]',
  },
  {
    username,
    email,
    avatar: '',
    initials: getInitials(username),
    outlineColor: 'border-[#323232]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#243c5a]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#00ff00]',
  },
];

/**
 * Primary viewport that houses the canvas
 * and accompanying widgets/buttons that lie
 * on top of it (absolutely positioned).
 * @authors Yousef Yassin
 */
const Viewport = () => {
  const {
    setMode,
    tool,
    isUsingStableDiffusion,
    isViewingComments,
    setIsViewingComments,
  } = useAppStore([
    'setMode',
    'tool',
    'isUsingStableDiffusion',
    'isViewingComments',
    'setIsViewingComments',
  ]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { selectedElementIds } = useCanvasElementStore(['selectedElementIds']);
  const isDrawingSelected = isDrawingTool(tool);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <RadixContextMenu.Root>
      <div
        id="Viewport"
        className="select-none"
        ref={viewportRef}
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          backgroundColor: 'transparent',
        }}
      >
        <RadixContextMenu.Trigger>
          <ShareScreen />
          <Canvas />
          {/* Add the comments here, make the sheet purple */}
          <StableDiffusionSheet />
          {/* Merge with screenselect */}
          <ShareBoardDialog
            open={isShareDialogOpen}
            setOpen={setIsShareDialogOpen}
            boardLink="https://doodles.com/SYSC4907"
            users={users}
          />
        </RadixContextMenu.Trigger>
        <div
          className="flex flex-col"
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          <div
            className="flex flex-row justify-between items-center p-[0.5rem]"
            style={{
              backgroundColor: 'white',
              flexGrow: 1,
              zIndex: 10,
            }}
          >
            <div className="flex flex-row">
              <div className="flex flex-row">
                <div
                  className="flex items-center pr-[1.5rem] pl-[0.5rem]"
                  style={{
                    height: '100%',
                  }}
                >
                  <Button
                    variant="secondary"
                    className="border-solid border-2 border-indigo-300 px-3 py-2"
                    onClick={() => setMode('dashboard')}
                  >
                    <span className="sr-only">Show history</span>
                    <ArrowLeftIcon className="h-4 w-4 stroke-indigo-300" />
                  </Button>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Sieve Principle Visuals
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Last Edited: September 23, 2023
                  </p>
                </div>
              </div>
            </div>
            <div
              className={`flex flex-row gap-12 items-center transition-spacing duration-300 ease-in-out ${
                isUsingStableDiffusion || isViewingComments ? 'mr-[25rem]' : ''
              }`}
            >
              <UserList users={users} />
              <Button
                variant="secondary"
                className="border-solid border-2 border-indigo-300 px-3 py-2"
                onClick={() => setIsViewingComments(!isViewingComments)}
              >
                <ChatBubbleIcon className="h-4 w-4 stroke-indigo-300" />
              </Button>
              <Button
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'h-9 w-90 bg-muted text-muted-foreground hover:bg-muted hover:text-black justify-start items-center',
                )}
                onClick={() => setIsShareDialogOpen(!isShareDialogOpen)}
              >
                <Users2Icon className="h-4 w-4 mr-2" />
                <span className="ml-auto  text-black">Share</span>
              </Button>
            </div>
          </div>
          <Separator />

          <div
            style={{
              backgroundColor: 'transparent',
              flexGrow: 90,
            }}
          >
            <RadixContextMenu.Root>
              <div
                id="Viewport"
                className="select-none"
                ref={viewportRef}
                style={{
                  position: 'relative',
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'transparent',
                }}
              >
                <ToolBar />
                {/* Only show the toolbar is an element is selected */}
                {(selectedElementIds.length === 1 || isDrawingSelected) && (
                  <CustomToolbar />
                )}
                <DropDownMenu viewportRef={viewportRef} />

                <div
                  className="flex gap-[0.5rem] z-10"
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                  }}
                >
                  <ZoomButtons />
                  <UndoRedoButtons />
                  <FullScreenButton viewportRef={viewportRef} />
                  <ShareScreenButton />
                  {IS_ELECTRON_INSTANCE && <TransparencyButton />}
                </div>
              </div>
              <ContextMenu />
            </RadixContextMenu.Root>
          </div>
        </div>
      </div>
      <ContextMenu />
    </RadixContextMenu.Root>
  );
};

export default Viewport;
