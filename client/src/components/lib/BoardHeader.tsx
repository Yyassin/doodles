import React from 'react';
import { Button, buttonVariants } from '../ui/button';
import { ArrowLeftIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import { Users2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserList from './UserList';
import { users } from '@/stores/WebSocketStore';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { unixToFormattedDate } from '@/lib/misc';

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
              {boardMeta.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Last Edited: {unixToFormattedDate(boardMeta.lastModified)}
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
          onClick={() => {
            setIsViewingComments(!isViewingComments);
            !isViewingComments && setIsUsingStableDiffusion(false);
          }}
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
  );
};

export default BoardHeader;
