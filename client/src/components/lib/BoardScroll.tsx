import React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';

/**
 * Define a react component that all the user's boards in a folder
 * @author Abdalla Abdelhadi
 */

export const BoardScroll = () => {
  const { setMode } = useAppStore(['setMode']);
  const { canvases, setBoardMeta } = useCanvasBoardStore([
    'canvases',
    'setBoardMeta',
  ]);

  return (
    <div className="relative flex  mx-2 items-center h-[250px]">
      <div className="w-full h-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth">
        {canvases.map((board) => (
          <div
            key={board.id}
            className="relative w-[500px] h-[200px] rounded-md inline-block mx-3 mt-4 bg-[#ebebeb] cursor-pointer hover:scale-105 ease-in-out duration-300"
            onClick={() => {
              setMode('canvas');
              // TODO: Should perform and cache concurrent fetches for the board and its comments here
              setBoardMeta({
                roomID: board.roomID,
                title: board.title,
                lastModified: board.updatedAt,
              });
            }}
          >
            {board.title}
            <div className="flex flex-row gap-2 absolute inset-x-0 bottom-0 items-center">
              <CalendarIcon className="ml-2" />
              <div>{board.updatedAt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
