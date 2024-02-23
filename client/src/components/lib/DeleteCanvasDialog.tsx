import React from 'react';
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

import { Separator } from '@radix-ui/react-dropdown-menu';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import axios from 'axios';
import { REST } from '@/constants';

/**
 * Alert dialog to conform deletion of canvas
 * @author Abdalla Abdelhadi
 */

export const DeleteCanavasDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const { boardMeta, removeCanvas, setBoardMeta } = useCanvasBoardStore([
    'boardMeta',
    'removeCanvas',
    'setBoardMeta',
  ]);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Canvas</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this canvas:{' '}
            <span className="font-bold text-black">{boardMeta.title}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="bg-gray-200 h-[0.5px]" />

        <AlertDialogFooter>
          <AlertDialogCancel className="text-[#818cf8] border-[#818cf8] hover:text-[#6c75c1] hover:border-[#6c75c1]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              removeCanvas(boardMeta.id);
              setBoardMeta({
                title: '',
                id: '',
                lastModified: '',
                roomID: '',
                shareUrl: '',
                folder: '',
                tags: [],
              });
              axios.delete(REST.board.deleteBoard, {
                params: { id: boardMeta.id },
              });
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
