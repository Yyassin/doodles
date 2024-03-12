import React, { useState } from 'react';
import { BoardScroll } from './BoardScroll';
import { Settings } from './Settings';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { TemplateScroll } from './TemplateScroll';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable';
import { TooltipProvider } from '../ui/tooltip';
import { Nav } from './Nav';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/AppStore';

/**
 * Define a react component that displays
 * main content of the page depending if your
 * are on folder, templates, or settings
 * @author Abdalla Abdelhadi
 */

export const Board = ({ folders }: { folders: string[] }) => {
  const { appWidth } = useAppStore(['appWidth']);
  const { board } = useCanvasBoardStore(['board']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col w-full h-full bg-[#FEFDFF]">
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full items-stretch"
        >
          <ResizablePanel
            collapsedSize={3}
            collapsible={true}
            minSize={15}
            maxSize={20}
            onCollapse={() => {
              setIsCollapsed(true);
            }}
            onExpand={() => {
              setIsCollapsed(false);
            }}
            className={cn(
              (isCollapsed || appWidth < 850) &&
                'min-w-[50px] transition-all duration-300 ease-in-out',
            )}
          >
            <Nav
              isCollapsed={isCollapsed || appWidth < 850}
              folders={folders}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={30} className="w-full">
            {/* <TopBar /> */}
            {board === 'Folder' && <BoardScroll />}
            {board == 'Settings' && <Settings />}
            {board == 'Templates' && <TemplateScroll />}
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
};
