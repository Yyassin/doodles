import React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';

/**
 * Define a react component that all the user's boards in a folder
 * @author Abdalla Abdelhadi
 */

export const BoardScroll = () => {
  const { setMode } = useAppStore(['setMode']);

  //To be changed to fetch proper boards based on folder
  const boards = [
    { board: 'unit1', date: '23.09.2023' },
    { board: 'unit2', date: '22.09.2023' },
    { board: 'unit3', date: '21.09.2023' },
    { board: 'unit4', date: '20.09.2023' },
    { board: 'unit5', date: '19.09.2023' },
  ];
  return (
    <div className="relative flex  mx-2 items-center h-[250px]">
      <div className="w-full h-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth">
        {boards.map((board) => (
          <div
            key={board.board}
            className="relative w-[500px] h-[200px] rounded-md inline-block mx-3 mt-4 bg-[#ebebeb] cursor-pointer hover:scale-105 ease-in-out duration-300"
            onClick={() => setMode('canvas')}
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
