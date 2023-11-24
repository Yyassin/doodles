import React from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { PlusIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { IconDropDown } from './IconDropDown';

/**
 * Define a react component that the top bar of the main dashboard
 * @author Abdalla Abdelhadi
 */

export const TopBar = () => {
  const { board, folder } = useCanvasBoardStore(['board', 'folder']);
  return (
    <div className="flex flex-col">
      <div className="flex flex-row ml-5 gap-5">
        <MagnifyingGlassIcon className="h-[25px] w-[25px] mt-2 inline-flex items-center justify-center" />
        <div className="flex h-[50px] flex-1">
          <input
            type="text"
            className="h-[25px] mt-2 basis-3/4"
            placeholder="Search Boards"
          />
        </div>

        <IconDropDown />
      </div>

      <div className="flex flex-row ml-5 gap-5 w-full">
        <div className="text-4xl font-bold">
          {folder !== '' && folder} {board}
        </div>
        {folder !== '' && (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="text-violet11 shadow-blackA4 hover:bg-violet3 inline-flex h-[35px] w-[35px] items-center justify-center rounded-lg bg-white outline outline-offset-0.5 outline-[#7f7dcf] focus:shadow-black hover:bg-[#eee8f9]">
                  <PlusIcon color="#7f7dcf" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                  sideOffset={5}
                >
                  Create New Board
                  <Tooltip.Arrow className="fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </div>
    </div>
  );
};