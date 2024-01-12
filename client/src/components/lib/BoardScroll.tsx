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
  const { setBoardMeta } = useCanvasBoardStore(['setBoardMeta']);

  //To be changed to fetch proper boards based on folder
  const boards = [
    { board: 'Sieve Principle Visuals', date: 1671880200, roomID: '1' },
    { board: 'Online Bipartite Matching', date: 1671881200, roomID: '2' },
    {
      board: 'Generative Adversarial Networks',
      date: 1671882200,
      roomID: '3',
    },
    { board: 'Two-player General Sum Games', date: 1671885200, roomID: '4' },
    {
      board: 'Counterfactual Regret Minimization',
      date: 1671887200,
      roomID: '5',
    },
  ];
  return (
    <div className="relative flex  mx-2 items-center h-[250px]">
      <div className="w-full h-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth">
        {boards.map((board) => (
          <div
            key={board.board}
            className="relative w-[500px] h-[200px] rounded-md inline-block mx-3 mt-4 bg-[#ebebeb] cursor-pointer hover:scale-105 ease-in-out duration-300"
            onClick={() => {
              setMode('canvas');
              setBoardMeta({
                roomID: board.roomID,
                title: board.board,
                lastModified: board.date,
              });
            }}
          >
            {board.board}
            <div className="flex flex-row gap-2 absolute inset-x-0 bottom-0">
              <CalendarIcon className="ml-2" />
              <div>{board.date} </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
