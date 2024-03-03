import React, { useState } from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Canvas, useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { Thumbnail } from './Thumbnail';
import { DeleteCanavasDialog } from './DeleteCanvasDialog';
import axios from 'axios';
import { REST } from '@/constants';
import {
  CanvasElement,
  CanvasElementState,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { renderElementsOnOffscreenCanvas } from '@/lib/export';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useAuthStore } from '@/stores/AuthStore';
import { fetchImageFromFirebaseStorage } from '@/views/SignInPage';

export const createStateWithRoughElement = (state: CanvasElementState) => {
  const roughElements: Record<string, CanvasElement['roughElement']> = {};

  //create the roughElements
  for (const [key, type] of Object.entries(state.types)) {
    const options = {
      stroke: state.strokeColors[key],
      fill: state.fillColors[key],
      font: state.fontFamilies[key],
      size: state.fontSizes[key],
      bowing: state.bowings[key],
      roughness: state.roughnesses[key],
      strokeWidth: state.strokeWidths[key],
      fillStyle: state.fillStyles[key],
      strokeLineDash: state.strokeLineDashes[key],
      opacity: state.opacities[key],
      text: state.textStrings[key],
      angle: state.angles[key],
    };

    roughElements[key] = createElement(
      key,
      state.p1[key].x,
      state.p1[key].y,
      state.p2[key].x,
      state.p2[key].y,
      type,
      undefined,
      options,
    ).roughElement;
  }
  state.roughElements = roughElements;
  state.fileIds = {};

  return state;
};

/**
 * Define a react component that all the user's boards in a folder
 * @author Abdalla Abdelhadi
 */

export const BoardScroll = ({
  searchCanvases,
}: {
  searchCanvases: Canvas[];
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [state, setState] = useState<CanvasElementState>();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const { canvases, boardMeta, folder, setBoardMeta } = useCanvasBoardStore([
    'canvases',
    'boardMeta',
    'folder',
    'setBoardMeta',
  ]);
  const { setCanvasElementState } = useCanvasElementStore([
    'setCanvasElementState',
  ]);
  const { userID } = useAuthStore(['userID']);

  const setCanvasState = () => {
    state && setCanvasElementState(state);
  };

  const { toast } = useToast();

  const sortedCavases = (
    searchCanvases.length === 0 ? canvases : searchCanvases
  )
    .filter((board) => (folder === 'Recent' ? true : folder === board.folder))
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);

      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="relative flex flex-col mx-2 h-full">
      <div className="w-full h-[250px] overflow-x-scroll scroll whitespace-nowrap scroll-smooth">
        {/* eslint-disable-next-line sonarjs/cognitive-complexity */}
        {sortedCavases.map((board) => (
          <div
            key={board.id}
            className={
              'relative w-[500px] h-[200px] rounded-md inline-block mx-3 mt-4 cursor-pointer hover:scale-105 ease-in-out duration-300 ' +
              (boardMeta.id === board.id ? 'bg-[#7f7dcf]' : 'bg-[#ebebeb]')
            }
            onClick={async () => {
              const isSelected = boardMeta.id === board.id;

              try {
                let collabID = ' ';
                let users = [];
                let permission = '';
                if (!isSelected) {
                  //todo
                  const boardState = await axios.get(REST.board.getBoard, {
                    params: { id: board.id, userID },
                  });

                  collabID = boardState.data.collabID;
                  users = boardState.data.users;
                  permission = boardState.data.permissionLevel;

                  const state = createStateWithRoughElement(
                    boardState.data.board.serialized,
                  );

                  setState(state);

                  const canvas = renderElementsOnOffscreenCanvas(state.allIds, {
                    p1: state.p1,
                    p2: state.p2,
                    angles: state.angles,
                    types: state.types,
                    freehandPoints: state.freehandPoints,
                    freehandBounds: state.freehandBounds,
                    textStrings: state.textStrings,
                    fontFamilies: state.fontFamilies,
                    fontSizes: state.fontSizes,
                    fillColors: state.fillColors,
                    isImagePlaceds: state.isImagePlaceds,
                    fileIds: state.fileIds,
                    roughElements: state.roughElements,
                    opacities: state.opacities,
                    strokeColors: state.strokeColors,
                    strokeWidths: state.strokeWidths,
                  });

                  setThumbnailUrl(canvas?.toDataURL('image/png') ?? '');
                }
                const collaboratorAvatarMeta = (
                  await axios.put(REST.collaborators.getAvatar, {
                    collaboratorIds: board.collaborators,
                  })
                ).data.collaborators;
                const collaboratorAvatarUrls = await Promise.all(
                  Object.entries(
                    collaboratorAvatarMeta as { id: string; avatar: string },
                  ).map(async ([id, avatar]) => ({
                    id,
                    avatar: (avatar ?? '').includes('https')
                      ? avatar
                      : await fetchImageFromFirebaseStorage(
                          `profilePictures/${avatar}.jpg`,
                        ),
                  })),
                );
                const collaboratorAvatarUrlsMap = collaboratorAvatarUrls.reduce(
                  (acc, { id, avatar }) => {
                    id && avatar && (acc[id] = avatar);
                    return acc;
                  },
                  {} as Record<string, string>,
                ) as Record<string, string>;
                // TODO: Should perform and cache concurrent fetches for the board and its comments here
                setBoardMeta({
                  roomID: isSelected ? '' : board.roomID,
                  title: isSelected ? '' : board.title,
                  id: isSelected ? '' : board.id,
                  lastModified: isSelected ? '' : board.updatedAt,
                  shareUrl: isSelected ? '' : board.shareUrl,
                  folder: isSelected ? '' : board.folder,
                  tags: isSelected ? [] : board.tags,
                  collabID: isSelected ? '' : collabID,
                  collaboratorAvatars: collaboratorAvatarUrlsMap,
                  users: isSelected ? '' : users,
                  permission: isSelected ? '' : permission,
                });
              } catch (error) {
                toast({
                  variant: 'destructive',
                  title: 'Something went wrong.',
                  description: 'There was a problem with your request.',
                  action: (
                    <ToastAction
                      onClick={() => window.location.reload()}
                      altText="Refresh"
                    >
                      Refresh
                    </ToastAction>
                  ),
                });
              }
            }}
          >
            {board.title}
            <div className="flex flex-row gap-2 absolute inset-x-0 bottom-0 items-center">
              <CalendarIcon className="ml-2" />
              <div>{board.updatedAt}</div>
            </div>
          </div>
        ))}
      </div>
      {boardMeta.id && (
        <Thumbnail
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          setState={setCanvasState}
          thumbnail={thumbnailUrl}
        />
      )}

      <DeleteCanavasDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
      />
    </div>
  );
};
