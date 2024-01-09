import { StreamSource } from '@/types';
import React, { useState } from 'react';
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
import * as AspectRatio from '@radix-ui/react-aspect-ratio';

/**
 * An alert dialog that is controlled by the `open` prop. It displays a list of
 * screen sources and allows the user to select one. When the user clicks
 * continue, the `onContinue` callback is called with the selected source ID.
 * @author Yousef Yassin
 */

const ScreenSelectDialog = ({
  open,
  setOpen,
  streamSources,
  onContinue,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  streamSources: StreamSource[];
  onContinue: (sourceId: string) => void;
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Select a screen to share!</AlertDialogTitle>
          <AlertDialogDescription>
            Let the annotation begin!
          </AlertDialogDescription>
          <div className="flex flex-wrap justify-center gap-4 overflow-y-scroll max-h-96 p-[1rem]">
            {streamSources
              // Only screen sources are supported in transparent mode.
              .map((source) => (
                <div key={source.id} className="flex flex-col">
                  <div
                    className={`w-[10rem] overflow-hidden rounded-md ${
                      source.id === selectedSourceId
                        ? 'ring-4 ring-offset-2 ring-[#818cf8]'
                        : 'hover:ring-2 hover:ring-offset-2 hover:ring-[#818cf8]'
                    }`}
                    onClick={() => setSelectedSourceId(source.id)}
                  >
                    <AspectRatio.Root ratio={source.thumbnail.aspect}>
                      <img
                        className="h-full w-full object-cover"
                        src={source.thumbnail.dataURL}
                      />
                    </AspectRatio.Root>
                  </div>
                  <p className="text-sm font-medium w-[10rem] truncate pt-[0.5rem]">
                    {source.name}
                  </p>
                </div>
              ))}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="text-[#818cf8] border-[#818cf8] hover:text-[#6c75c1] hover:border-[#6c75c1]"
            onClick={() => setSelectedSourceId(null)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#818cf8] hover:bg-[#6c75c1]"
            disabled={selectedSourceId === null}
            onClick={() => selectedSourceId && onContinue(selectedSourceId)}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScreenSelectDialog;
