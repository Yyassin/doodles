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
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useToast } from '../ui/use-toast';

/**
 * An alert dialog where user can edit board data
 * @author Zakariyya Almalki
 */

export default function PublishTemplateDialog({
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

  const {
    boardMeta,
    setTag,
    setBoardMeta,
    updateCanvas,
    updateCanvasInfo: updateCanvasInfo,
  } = useCanvasBoardStore([
    'boardMeta',
    'setTag',
    'setBoardMeta',
    'updateCanvas',
    'updateCanvasInfo',
  ]);
  const { toast } = useToast();

  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);
  const {
    selectedElementIds,
    allIds,
    types,
    strokeColors,
    fillColors,
    fontFamilies,
    fontSizes,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    freehandPoints,
    p1,
    p2,
    textStrings,
    isImagePlaceds,
    freehandBounds,
    angles,
    fileIds,
    resetCanvas,
  } = useCanvasElementStore([
    'selectedElementIds',
    'allIds',
    'types',
    'strokeColors',
    'fillColors',
    'fontFamilies',
    'fontSizes',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'freehandPoints',
    'p1',
    'p2',
    'textStrings',
    'isImagePlaceds',
    'freehandBounds',
    'angles',
    'fileIds',
    'resetCanvas',
  ]);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Board</AlertDialogTitle>
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

        <AlertDialogFooter>
          <AlertDialogCancel className="text-[#818cf8] border-[#818cf8] hover:text-[#6c75c1] hover:border-[#6c75c1]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#818cf8] hover:bg-[#6c75c1]"
            onClick={async () => {
              try {
                const state = {
                  allIds,
                  types,
                  strokeColors,
                  fillColors,
                  fontFamilies,
                  fontSizes,
                  bowings,
                  roughnesses,
                  strokeWidths,
                  fillStyles,
                  strokeLineDashes,
                  opacities,
                  freehandPoints,
                  p1,
                  p2,
                  textStrings,
                  isImagePlaceds,
                  freehandBounds,
                  angles,
                  fileIds,
                };

                await axios.post(REST.template.create, {
                  serialized: { serialized: state },
                  title: titleRef.current?.value,
                });
                toast({
                  title: 'Successfully Published',
                });
              } catch (error) {
                console.error('Error creating template:', error);
              }
            }}
          >
            Publish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
