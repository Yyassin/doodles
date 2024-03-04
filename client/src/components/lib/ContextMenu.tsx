import React from 'react';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { TrashIcon } from '@radix-ui/react-icons';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ExportSelectedPNGContextItem from './ExportSelectedPNGContextItem';
import ContextMenuItem from './ContextMenuItem';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import StableDiffusionContextItem from './StableDiffusion/StableDiffusionContextItem';
import FileUpload from './UploadFilesToFirebase';
import LinkAttach from './UploadLink';
import deleteFilefromFirebase from './DeleteFileFromFirebase';

/**
 * Defines a context menu, with options, that is revealed
 * on canvas right click.
 * @author Yousef Yassin, Dana El Sherif
 */

const ContextMenu = () => {
  const {
    removeCanvasElements,
    setSelectedElements,
    selectedElementIds,
    pushCanvasHistory,
    removeAttachedFileUrl,
    removeAttachedUrl,
    attachedFileUrls,
    attachedUrls,
  } = useCanvasElementStore([
    'removeCanvasElements',
    'setSelectedElements',
    'selectedElementIds',
    'pushCanvasHistory',
    'removeAttachedFileUrl',
    'removeAttachedUrl',
    'attachedFileUrls',
    'attachedUrls',
  ]);

  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);

  return (
    <RadixContextMenu.Portal>
      <RadixContextMenu.Content
        className="min-w-[220px] bg-white rounded-md overflow-hidden p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sideOffset={5}
        align="end"
      >
        {selectedElementIds.length ? (
          <>
            <ContextMenuItem
              onClick={() => {
                const ids = selectedElementIds;
                setSelectedElements([]);
                removeCanvasElements(ids);
                pushCanvasHistory();
                setWebsocketAction(ids, 'removeCanvasElements');
              }}
              className="text-red-700"
            >
              Delete{' '}
              <div className="ml-auto pl-5 text-red-700 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                <TrashIcon />
              </div>
            </ContextMenuItem>
            <ExportSelectedPNGContextItem />
            <StableDiffusionContextItem />

            {attachedUrls[selectedElementIds[0]] === undefined && (
              <FileUpload />
            )}
            {attachedUrls[selectedElementIds[0]] === undefined && (
              <ContextMenuItem
                onClick={() => {
                  const ids = selectedElementIds;
                  setSelectedElements([]);
                  const link = attachedFileUrls[selectedElementIds[0]];
                  if (link !== undefined) {
                    deleteFilefromFirebase(link);
                  }
                  removeAttachedFileUrl(ids); //Don't want users to be able to undo deletion
                  setWebsocketAction(ids, 'removeAttachedFileUrl');
                }}
                className="text-red-700"
              >
                Delete Attatched File{' '}
                <div className="ml-auto pl-5 text-red-700 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                  <TrashIcon />
                </div>
              </ContextMenuItem>
            )}

            {attachedFileUrls[selectedElementIds[0]] === undefined && (
              <LinkAttach />
            )}
            {attachedFileUrls[selectedElementIds[0]] === undefined && (
              <ContextMenuItem
                onClick={() => {
                  const ids = selectedElementIds;
                  setSelectedElements([]);
                  removeAttachedUrl(ids);
                  setWebsocketAction(ids, 'removeAttachedUrl');
                }}
                className="text-red-700"
              >
                Delete Attatched Link{' '}
                <div className="ml-auto pl-5 text-red-700 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                  <TrashIcon />
                </div>
              </ContextMenuItem>
            )}
          </>
        ) : null}
      </RadixContextMenu.Content>
    </RadixContextMenu.Portal>
  );
};

export default ContextMenu;
