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
                        ? 'ring-4 ring-offset-2 ring-blue-500'
                        : 'hover:ring-2 hover:ring-offset-2 hover:ring-blue-500'
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
          <AlertDialogCancel onClick={() => setSelectedSourceId(null)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
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
