import React, { useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '../ui/input';
import { PlusCircleIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import axios from 'axios';
import { REST } from '@/constants';
import { useWebSocketStore } from '@/stores/WebSocketStore';

/**
 * An alert dialog where user can edit board data
 * @author Zakariyya Almalki
 */

export default function EditBoardDataDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  /* Controls visibility of the addition input. */
  const [isAddTagOpen, setIsTagUserOpen] = useState(false);
  const tagRef = useRef<HTMLInputElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const folderRef = useRef<HTMLInputElement | null>(null);

  const { boardMeta, setTag, setBoardMeta, updateCanvas, updateCanvasINFO } =
    useCanvasBoardStore([
      'boardMeta',
      'setTag',
      'setBoardMeta',
      'updateCanvas',
      'updateCanvasINFO',
    ]);

  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Board Data</AlertDialogTitle>
          <AlertDialogDescription>Edit Board Data</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-gray-700 mr-1">
            Title:
          </label>
          <Input
            defaultValue={boardMeta.title}
            className="mt-1 block w-full"
            ref={titleRef}
          />
        </div>
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-gray-700 mr-1">
            Folder:
          </label>
          <Input
            defaultValue={boardMeta.folder}
            className="mt-1 block w-full"
            ref={folderRef}
          />
        </div>
        <div className="flex items-center">
          <h2 className="text-sm font-semibold text-black">Add Tags</h2>
          <PlusCircleIcon
            className="w-4 ml-2 cursor-pointer text-[#818cf8] hover:text-[#6c75c1]"
            onClick={() => setIsTagUserOpen(!isAddTagOpen)}
          />
        </div>
        {isAddTagOpen && (
          <div className="flex flex-row gap-4">
            <Input
              placeholder="Enter Tags to Add to Board"
              className="p-[1rem]"
              ref={tagRef}
            />
            <Button
              onClick={() => {
                const tag = tagRef.current?.value;
                if (tag && !boardMeta.tags.includes(tag)) {
                  setTag([...boardMeta.tags, tag]);
                }
              }}
              className="bg-[#818cf8] hover:bg-[#6c75c1]"
            >
              Add
            </Button>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-4 overflow-y-scroll max-h-60 p-[1rem]">
          {boardMeta.tags.map((tag, index) => (
            <div
              onClick={() =>
                setTag(boardMeta.tags.filter((item) => item !== tag))
              }
              key={index}
              className="bg-gray-200 rounded-md p-2 text-sm"
            >
              {tag}
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="text-[#818cf8] border-[#818cf8] hover:text-[#6c75c1] hover:border-[#6c75c1]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#818cf8] hover:bg-[#6c75c1]"
            onClick={async () => {
              const newTitle = titleRef.current?.value;
              const newFolder = folderRef.current?.value;
              const updatedAt = await axios.put(REST.board.updateBoard, {
                id: boardMeta.id,
                fields: {
                  title: newTitle,
                  tags: boardMeta.tags,
                  folder: newFolder,
                },
              });
              setBoardMeta({
                title: newTitle,
                tags: boardMeta.tags,
                folder: newFolder,
                lastModified: updatedAt.data.updatedAt,
              });
              updateCanvas(boardMeta.id, updatedAt.data.updatedAt);
              updateCanvasINFO(
                boardMeta.id,
                newTitle ?? '',
                newFolder ?? '',
                boardMeta.tags,
              );
              setWebsocketAction(
                {
                  boardID: boardMeta.id,
                  lastModified: updatedAt.data.updatedAt,
                },
                'updateUpdatedTime',
              );
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
