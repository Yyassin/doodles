import React from 'react';
import { TopBar } from '@/components/lib/TopBar';
import { BoardScroll } from './BoardScroll';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';

/**
 * Define a react component that displays
 * main content of the page depending if your
 * are on folder, templates, or settings
 * @author Abdalla Abdelhadi
 */

export const Board = () => {
  const { board } = useCanvasBoardStore(['board']);
  return (
    <div className="flex flex-col w-5/6 h-full bg-[#FEFDFF]">
      <TopBar />
      {board === 'Folder' && <BoardScroll />}
      {/** To be added template and setting page */}
    </div>
  );
};
