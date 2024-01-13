import React from 'react';
import { Button, buttonVariants } from '../ui/button';
import { ArrowLeftIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import { Users2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserList from './UserList/UserList';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { unixToFormattedDate } from '@/lib/misc';

/**
 * Defines a header for the board containing the title, last modified date, and buttons for sharing and viewing comments. A list of active
 * users in the room is also displayed.
 * @author Yousef Yassin
 */

/**
 * The board header component.
 * @param Control parameters for the share dialog.
 * @returns The component
 */
const BoardHeader = ({
  isShareDialogOpen,
  setIsShareDialogOpen,
}: {
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (value: boolean) => void;
}) => {
  const { boardMeta } = useCanvasBoardStore(['boardMeta']);
  const {
    setMode,
    isUsingStableDiffusion,
    isViewingComments,
    setIsViewingComments,
    setIsUsingStableDiffusion,
  } = useAppStore([
    'setMode',
    'isUsingStableDiffusion',
    'isViewingComments',
    'setIsViewingComments',
    'setIsUsingStableDiffusion',
  ]);

  return (
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
            {/* Back to dashboard button */}
            <Button
              variant="secondary"
              className="border-solid border-2 border-indigo-300 hover:border-indigo-400 stroke-indigo-300 hover:stroke-indigo-400 px-3 py-2"
              onClick={() => setMode('dashboard')}
            >
              <span className="sr-only">Back to dashboard</span>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </div>
          {/* Board info */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold tracking-tight">
              {boardMeta.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Last Edited: {unixToFormattedDate(boardMeta.lastModified)}
            </p>
          </div>
        </div>
      </div>
      {/* Right side justified, we push this to the left when the sidebar is opened */}
      <div
        className={`flex flex-row gap-12 items-center transition-spacing duration-300 ease-in-out ${
          isUsingStableDiffusion || isViewingComments ? 'mr-[25rem]' : ''
        }`}
      >
        {/* Avatars of active tenants */}
        <UserList />
        {/* Comment section button */}
        <Button
          variant="secondary"
          className="border-solid border-2 border-indigo-300 hover:border-indigo-400 stroke-indigo-300 hover:stroke-indigo-400 px-3 py-2 "
          onClick={() => {
            setIsViewingComments(!isViewingComments);
            !isViewingComments && setIsUsingStableDiffusion(false);
          }}
        >
          <ChatBubbleIcon className="h-4 w-4" />
        </Button>
        {/* Share Dialog */}
        <Button
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-full bg-muted text-gray-200 bg-indigo-300 hover:bg-indigo-400 hover:text-white justify-start items-center border-2 border-indigo-300 hover:border-indigo-400',
          )}
          onClick={() => setIsShareDialogOpen(!isShareDialogOpen)}
        >
          <Users2Icon className="h-4 w-4 mr-2" />
          <span className="ml-auto">Share</span>
        </Button>
      </div>
    </div>
  );
};

export default BoardHeader;
