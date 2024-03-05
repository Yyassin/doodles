import React, { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '../ui/input';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import axios from 'axios';
import { REST } from '@/constants';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useToast } from '../ui/use-toast';

/**
 * An alert dialog where user can edit board data
 * @author Ibrahim Almalki
 */

export default function PublishTemplateDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  /* Controls visibility of the addition input. */
  const titleRef = useRef<HTMLInputElement | null>(null);

  const { boardMeta } = useCanvasBoardStore(['boardMeta']);
  const { toast } = useToast();

  const {
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
  } = useCanvasElementStore([
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
