import React, { useState } from 'react';
import { TopBar } from '@/components/lib/TopBar';
import { BoardScroll } from './BoardScroll';
import { Settings } from './Settings';
import { Canvas, useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { TemplateScroll } from './TemplateScroll';

/**
 * Define a react component that displays
 * main content of the page depending if your
 * are on folder, templates, or settings
 * @author Abdalla Abdelhadi
 */

export const Board = () => {
  const { board } = useCanvasBoardStore(['board']);
  const [searchCanvases, setSearchCanvases] = useState<Canvas[]>([]);
  return (
    <div className="flex flex-col w-5/6 h-full bg-[#FEFDFF]">
      <TopBar setSearchCanvases={setSearchCanvases} />
      {board === 'Folder' && <BoardScroll searchCanvases={searchCanvases} />}
      {board == 'Settings' && <Settings />}
      {board == 'Templates' && <TemplateScroll />}
    </div>
  );
};
