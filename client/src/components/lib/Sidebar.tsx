import React, { useState } from 'react';
import { GearIcon, ArchiveIcon, FileTextIcon } from '@radix-ui/react-icons';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';

/**
 * Define a react component that displays a side bar on the main page
 * @author Abdalla Abdelhadi
 */

//consts used throughtout the component
const FOLDER = 'Folder';
const TEMPLATES = 'Templates';
const SETTINGS = 'Settings';

export const Sidebar = ({ folders }: { folders: string[] }) => {
  const [bar, setBar] = useState(FOLDER);
  const { folder, setBoard } = useCanvasBoardStore(['folder', 'setBoard']);

  return (
    <div className="flex flex-col w-1/6 h-full bg-[#eee8f9] text-black boarder-r">
      {/**To be changed to acctual project logo*/}
      <div className="flex mb-10 justify-center">
        <img className="w-24 h-[auto]" src="./doodles-icon.png" alt="logo" />
      </div>
      <div className="space-y-2">
        <div
          className={`flex flex-row relative gap-7 py-2.5 px-8 cursor-pointer rounded transition duration-200 hover:bg-[#cdc5db] ${
            bar === FOLDER && 'font-bold'
          }`}
          onClick={() => {
            setBoard(FOLDER, 'Recent');
            setBar(FOLDER);
          }}
        >
          <ArchiveIcon className="mt-1" />
          Folder
          {bar === FOLDER && (
            <div className="absolute inset-y-0 right-0 bg-black w-1 rounded-md "></div>
          )}
        </div>
        {/**Make a bar for each of the different folders the user has*/}
        {folders.map((boardFolder) => (
          <div
            key={boardFolder}
            className={`flex flex-row px-24 cursor-pointer rounded transition duration-200 hover:bg-[#cdc5db] ${
              folder === boardFolder && 'bg-[#cdc5db]'
            }`}
            onClick={() => {
              setBoard(FOLDER, boardFolder);
              setBar(FOLDER);
            }}
          >
            {boardFolder}
          </div>
        ))}

        <div
          className={`flex flex-row relative gap-7 py-2.5 px-8 cursor-pointer rounded transition duration-200 hover:bg-[#cdc5db] ${
            bar === TEMPLATES && 'font-bold bg-[#cdc5db]'
          }`}
          onClick={() => {
            setBoard(TEMPLATES, '');
            setBar(TEMPLATES);
          }}
        >
          <FileTextIcon className="mt-1" />
          Templates
          {bar === TEMPLATES && (
            <div className="absolute inset-y-0 right-0 bg-black w-1 rounded-md "></div>
          )}
        </div>
        <div
          className={`flex flex-row relative gap-7 py-2.5 px-8 cursor-pointer rounded transition duration-200 hover:bg-[#cdc5db] ${
            bar === SETTINGS && 'font-bold bg-[#cdc5db]'
          }`}
          onClick={() => {
            setBoard(SETTINGS, '');
            setBar(SETTINGS);
          }}
        >
          <GearIcon className="mt-1" />
          Settings
          {bar === SETTINGS && (
            <div className="absolute inset-y-0 right-0 bg-black w-1 rounded-md "></div>
          )}
        </div>
      </div>
    </div>
  );
};
