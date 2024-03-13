import { ArchiveIcon, FileTextIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { Link } from '@radix-ui/themes';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { GearIcon } from '@radix-ui/react-icons';

//consts used throughtout the component
const FOLDER = 'Folder';
const TEMPLATES = 'Templates';
const SETTINGS = 'Settings';

export function Nav({
  isCollapsed,
  folders,
}: {
  isCollapsed: boolean;
  folders: string[];
}) {
  const [bar, setBar] = useState(FOLDER);
  const { folder, setBoard } = useCanvasBoardStore(['folder', 'setBoard']);

  const links = [
    {
      title: 'Folder',
      icon: ArchiveIcon,
      variant: 'default',
      onClick: () => {
        setBoard(FOLDER, 'Recent');
        setBar(FOLDER);
      },
      isSelected: bar === FOLDER,
    },
    ...folders.map((boardFolder) => ({
      title: boardFolder,
      icon: null,
      variant: 'default',
      onClick: () => {
        setBoard(FOLDER, boardFolder);
        setBar(FOLDER);
      },
      isSelected: folder === boardFolder,
    })),
    {
      title: 'Templates',
      icon: FileTextIcon,
      variant: 'default',
      onClick: () => {
        setBoard(TEMPLATES, '');
        setBar(TEMPLATES);
      },
      isSelected: bar === TEMPLATES,
    },
    {
      title: 'Settings',
      icon: GearIcon,
      variant: 'default',
      onClick: () => {
        setBoard(SETTINGS, '');
        setBar(SETTINGS);
      },
      isSelected: bar === SETTINGS,
    },
  ];

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2 bg-[#e6e6fa] h-full"
    >
      <div className="flex mb-10 justify-center">
        <img
          className="w-36 h-[auto] p-4"
          src="./doodles-icon.png"
          alt="logo"
        />
      </div>
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          !isCollapsed ? (
            <Link
              key={index}
              className={cn(
                buttonVariants({ size: 'sm' }),
                `justify-start text-md capitalize ${
                  link.isSelected
                    ? 'text-[black] bg-[#cdc5db] hover:bg-[#cdc5db]'
                    : 'text-[#4b4b4b] bg-transparent hover:bg-[#cdc5db]'
                }`,
              )}
              onClick={link.onClick}
            >
              {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              <span className={`${!link.icon ? 'ml-[1.5rem]' : ''}`}>
                {link.title}
              </span>
            </Link>
          ) : link.icon ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  className={cn(
                    buttonVariants({ size: 'icon' }),
                    'h-9 w-9',
                    `${
                      link.isSelected
                        ? 'text-[black] bg-[#cdc5db] hover:bg-[#cdc5db]'
                        : 'text-[#4b4b4b] bg-transparent hover:bg-[#cdc5db]'
                    }`,
                  )}
                  onClick={link.onClick}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
              </TooltipContent>
            </Tooltip>
          ) : null,
        )}
      </nav>
    </div>
  );
}
