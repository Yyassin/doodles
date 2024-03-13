import React, { useEffect, useState } from 'react';
import { Circles } from 'react-loader-spinner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlusIcon, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Canvas, useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import Fuse from 'fuse.js';
import { DeleteCanavasDialog } from './DeleteCanvasDialog';
import { Thumbnail } from './Thumbnail';
import { ToastAction } from '@radix-ui/react-toast';
import { useToast } from '../ui/use-toast';
import { fetchImageFromFirebaseStorage } from '@/views/SignInPage';
import { commitImageToCache, getImageDataUrl } from '@/lib/image';
import { BinaryFileData } from '@/types';
import {
  CanvasElement,
  CanvasElementState,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { renderElementsOnOffscreenCanvas } from '@/lib/export';
import axios from 'axios';
import { REST } from '@/constants';
import { ScrollBar } from '../ui/scroll-area';
import { ScrollArea } from '@radix-ui/themes';
import { Badge } from '../ui/badge';
import { useAppStore } from '@/stores/AppStore';
import { IconDropDown } from './IconDropDown';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';

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

  return state;
};

/**
 * Define a react component that all the user's boards in a folder
 * @author Abdalla Abdelhadi
 */

export const BoardScroll = () => {
  const { setMode } = useAppStore(['setMode']);
  const { canvases, boardMeta, board, folder, setBoardMeta, addCanvas } =
    useCanvasBoardStore([
      'canvases',
      'boardMeta',
      'board',
      'folder',
      'setBoardMeta',
      'addCanvas',
    ]);
  const { setCanvasElementState, editCanvasElement, fileIds } =
    useCanvasElementStore([
      'setCanvasElementState',
      'editCanvasElement',
      'fileIds',
    ]);
  const { userID } = useAuthStore(['userID']);

  const setCanvasState = () => {
    state && setCanvasElementState(state);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [searchCanvases, setSearchCanvases] = useState<Canvas[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [state, setState] = useState<CanvasElementState>();
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const fuseOptions = { keys: ['title', 'tags'] };
  const fuse = new Fuse(canvases, fuseOptions);

  const { toast } = useToast();
  useEffect(() => {
    setBoardMeta({ title: '', id: '' });
  }, [folder]);
  const sortedCavases = (
    searchCanvases.length === 0 ? canvases : searchCanvases
  )
    .filter((board) => (folder === 'Recent' ? true : folder === board.folder))
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);

      return dateB.getTime() - dateA.getTime();
    });

  useEffect(() => {
    if (state === undefined) return;

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
      fileIds: fileIds,
      roughElements: state.roughElements,
      opacities: state.opacities,
      strokeColors: state.strokeColors,
      strokeWidths: state.strokeWidths,
    });

    setThumbnailUrl(canvas?.toDataURL('image/png') ?? '');
    setIsLoading(false);
    // Rerender on isImagePlaceds change to update the thumbnail
  }, [state, fileIds]);

  const isOwner =
    boardMeta.users.find((user) => user.collabID === boardMeta.collabID)
      ?.permission === 'owner';

  return (
    <div className="w-full h-full p-4 backdrop-blur overflow-auto">
      <div className="flex flex-row justify-between items-center">
        <form className="flex-grow pr-6">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Boards"
              className="pl-8"
              onChange={(e) =>
                setSearchCanvases(
                  fuse.search(e.target.value).map((target) => target.item),
                )
              }
            />
          </div>
        </form>
        <IconDropDown />
      </div>

      <div className="flex items-center gap-10 pt-[1rem]">
        <div className="text-4xl font-bold !min-w-[15rem] capitalize">
          {folder !== '' && folder} {board}
        </div>
        <button
          onClick={async () => {
            // TODO: Should perform and cache concurrent fetches for the board and its comments here
            const state = {
              allIds: [],
              types: {},
              strokeColors: {},
              fillColors: {},
              fontFamilies: {},
              fontSizes: {},
              bowings: {},
              roughnesses: {},
              strokeWidths: {},
              fillStyles: {},
              strokeLineDashes: {},
              opacities: {},
              freehandPoints: {},
              p1: {},
              p2: {},
              textStrings: {},
              isImagePlaceds: {},
              freehandBounds: {},
              angles: {},
              fileIds: {},
            };

            const data = await axios.post(REST.board.create, {
              user: userID,
              serialized: state,
              title: 'Untitled',
              shareUrl: window.location.href,
            });

            const boardData = data.data.board;
            delete boardData.fastFireOptions;
            delete boardData.serialized;
            delete boardData.uid;

            addCanvas(boardData);

            setBoardMeta({
              roomID: boardData.roomID,
              title: boardData.title,
              id: boardData.id,
              lastModified: boardData.updatedAt,
              shareUrl: boardData.shareUrl,
              folder: boardData.folder,
              tags: boardData.tags,
              collabID: data.data.collabID,
              users: data.data.users,
              permission: data.data.permissionLevel,
            });

            const collaboratorAvatarMeta = (
              await axios.put(REST.collaborators.getAvatar, {
                collaboratorIds: boardData.collaborators,
              })
            ).data.collaborators;
            const collaboratorAvatarUrls = await Promise.all(
              Object.entries(
                collaboratorAvatarMeta as {
                  id: string;
                  avatar: string;
                },
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

            addCanvas(boardData);

            setBoardMeta({
              roomID: boardData.roomID,
              title: boardData.title,
              id: boardData.id,
              lastModified: boardData.updatedAt,
              shareUrl: boardData.shareUrl,
              folder: boardData.folder,
              tags: boardData.tags,
              collabID: data.data.collabID,
              users: data.data.users,
              permission: data.data.permissionLevel,
              collaboratorAvatars: collaboratorAvatarUrlsMap,
            });

            setMode('canvas');
          }}
          className="text-violet11 shadow-blackA4 hover:bg-violet3 inline-flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-white border-[0.2rem] border-[#7f7dcf] focus:shadow-black hover:bg-[#eee8f9]"
        >
          <PlusIcon color="#7f7dcf" />
        </button>
      </div>
      <div className="relative flex flex-col pt-4">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex flex-row gap-2 h-[10rem] mb-6">
            {/* eslint-disable-next-line sonarjs/cognitive-complexity */}
            {sortedCavases.map((board) => (
              <button
                key={board.id}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent min-w-[20rem]',
                  boardMeta.id === board.id && 'bg-muted',
                )}
                onClick={async () => {
                  const isSelected = boardMeta.id === board.id;

                  try {
                    let collabID = ' ';
                    let users = [];
                    let permission = '';
                    if (!isSelected) {
                      setIsLoading(true);
                      //todo
                      const boardState = await axios.get(REST.board.getBoard, {
                        params: { id: board.id, userID },
                      });

                      // Fetch images from firebase storage
                      Object.entries(
                        boardState.data.board.serialized.fileIds,
                      ).forEach(async ([elemId, fileId]) => {
                        const imageUrl = await fetchImageFromFirebaseStorage(
                          `boardImages/${fileId}.jpg`,
                        );
                        const dataUrl =
                          imageUrl && (await getImageDataUrl(imageUrl));
                        if (!dataUrl)
                          throw new Error(
                            'Failed to resolve saved image dataurls',
                          );

                        const binary = {
                          dataURL: dataUrl,
                          id: fileId,
                          mimeType: 'image/jpeg',
                        } as BinaryFileData;

                        const imageElement = { id: elemId };
                        commitImageToCache(
                          {
                            ...binary,
                            lastRetrieved: Date.now(),
                          },
                          imageElement,
                          // Will set fileIds, triggering a rerender. A placeholder
                          // will be shown in the mean time.
                          editCanvasElement,
                        );
                      });

                      collabID = boardState.data.collabID;
                      users = boardState.data.users;
                      permission = boardState.data.permissionLevel;

                      const state = createStateWithRoughElement(
                        boardState.data.board.serialized,
                      );
                      setState(state);
                    }
                    const collaboratorAvatarMeta = (
                      await axios.put(REST.collaborators.getAvatar, {
                        collaboratorIds: board.collaborators,
                      })
                    ).data.collaborators;
                    const collaboratorAvatarUrls = await Promise.all(
                      Object.entries(
                        collaboratorAvatarMeta as {
                          id: string;
                          avatar: string;
                        },
                      ).map(async ([id, avatar]) => ({
                        id,
                        avatar: (avatar ?? '').includes('https')
                          ? avatar
                          : await fetchImageFromFirebaseStorage(
                              `profilePictures/${avatar}.jpg`,
                            ),
                      })),
                    );
                    const collaboratorAvatarUrlsMap =
                      collaboratorAvatarUrls.reduce(
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
                <div className="flex w-full flex-col gap-1 pb-[5rem]">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{board.title}</div>
                    </div>
                    <div
                      className={cn(
                        'ml-auto text-xs',
                        boardMeta.id === board.id
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {formatDistanceToNow(new Date(board.updatedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
                {[board.folder, ...board.tags].filter((tag) => tag !== 'none')
                  .length ? (
                  <div className="flex items-center gap-2">
                    {[board.folder, ...board.tags]
                      .filter((tag) => tag !== 'none')
                      .map((label) => (
                        <Badge key={label}>{label}</Badge>
                      ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {boardMeta.id &&
          board === 'Folder' &&
          (isLoading ? (
            <div className="h-[20rem] w-full flex items-center justify-center">
              <Circles
                height="80"
                width="80"
                color="#98a2e3"
                ariaLabel="circles-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
              />
            </div>
          ) : (
            <Thumbnail
              disabled={!isOwner}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              setState={setCanvasState}
              thumbnail={thumbnailUrl}
            />
          ))}

        <DeleteCanavasDialog
          open={isDeleteDialogOpen}
          setOpen={setIsDeleteDialogOpen}
        />
      </div>
    </div>
  );
};
