import React from 'react';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '../ui/button';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { useAppStore } from '@/stores/AppStore';

/**
 * Define a react component displays Thumbnail
 * @author Abdalla Abdelhadi
 */

export const Thumbnail = ({
  thumbnail,
  setState,
  setIsDeleteDialogOpen,
  disabled,
}: {
  thumbnail: string;
  setState: () => void;
  setIsDeleteDialogOpen: (value: boolean) => void;
  disabled: boolean;
}) => {
  const { setMode } = useAppStore(['setMode']);
  const { boardMeta } = useCanvasBoardStore(['boardMeta']);

  return (
    <div className="relative flex flex-col mx-4 mt-2">
      <div className="relative flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">
          {boardMeta.title}
        </h2>

        <div className="flex flex-row gap-3">
          <Button
            disabled={disabled}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'h-full bg-muted text-gray-200 bg-red-600 hover:bg-red-700 hover:text-white justify-start items-center border-2 border-red-600 hover:border-red-700',
            )}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <span className="ml-auto">Delete</span>
          </Button>

          <Button
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'h-full bg-muted text-gray-200 bg-[#7f7dcf] hover:bg-indigo-400 hover:text-white justify-start items-center border-2 border-[#7f7dcf] hover:border-indigo-400',
            )}
            onClick={() => {
              setState();
              setMode('canvas');
            }}
          >
            <span className="ml-auto">Open</span>
          </Button>
        </div>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden w-full h-full">
        {thumbnail !== 'data:,' && thumbnail && (
          <img
            src={thumbnail}
            alt="No Thumbnail"
            className="max-w-[400px] max-h-[400px] w-auto h-auto"
          />
        )}
      </div>
    </div>
  );
};
