import React, { useEffect, useState } from 'react';
import { Circles } from 'react-loader-spinner';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import axios from 'axios';
import { REST } from '@/constants';
import {
  CanvasElementState,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { renderElementsOnOffscreenCanvas } from '@/lib/export';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useAuthStore } from '@/stores/AuthStore';
import { createStateWithRoughElement } from './BoardScroll';
import { TemplateThumbnail } from './TemplateThumbnail';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import Fuse from 'fuse.js';
import { IconDropDown } from './IconDropDown';

/**
 * Define a react component that all the user's boards in a folder
 * @author Abdalla Abdelhadi, Ibrahim Almalki
 */

export const TemplateScroll = () => {
  const [state, setState] = useState<CanvasElementState>();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [templates, setTemplate] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const { boardMeta, board, setBoardMeta, addCanvas } = useCanvasBoardStore([
    'boardMeta',
    'board',
    'setBoardMeta',
    'addCanvas',
  ]);
  const { setCanvasElementState } = useCanvasElementStore([
    'setCanvasElementState',
  ]);
  const { userID } = useAuthStore(['userID']);

  const [searchTemplates, setSearchTemplates] = useState<
    { id: string; title: string }[]
  >([]);
  const fuseOptions = { keys: ['title'] };
  const fuse = new Fuse(templates, fuseOptions);

  const setCanvasState = async () => {
    if (state === undefined) return;
    setCanvasElementState(state);

    const stateNewBoard = {
      allIds: state.allIds,
      types: state.types,
      strokeColors: state.strokeColors,
      fillColors: state.fillColors,
      fontFamilies: state.fontFamilies,
      fontSizes: state.fontSizes,
      bowings: state.bowings,
      roughnesses: state.roughnesses,
      strokeWidths: state.strokeWidths,
      fillStyles: state.fillStyles,
      strokeLineDashes: state.strokeLineDashes,
      opacities: state.opacities,
      freehandPoints: state.freehandPoints,
      p1: state.p1,
      p2: state.p2,
      textStrings: state.textStrings,
      isImagePlaceds: state.isImagePlaceds,
      freehandBounds: state.freehandBounds,
      angles: state.angles,
      fileIds: state.fileIds,
    };

    //todo
    const data = await axios.post(REST.board.create, {
      user: userID,
      serialized: stateNewBoard,
      title: boardMeta.title + ' (template)',
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
  };

  const { toast } = useToast();

  useEffect(() => {
    setBoardMeta({ title: '', id: '' });
    (async () => {
      try {
        const templates = await axios.get(REST.template.getAll);

        setTemplate(templates.data.templates);
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
    })();
  }, []);

  return (
    <div className="relative flex flex-col h-full p-4">
      <div className="flex flex-row justify-between items-center">
        <form className="flex-grow pr-6">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Boards"
              className="pl-8"
              onChange={(e) => {
                setSearchTemplates(
                  fuse.search(e.target.value).map((target) => target.item),
                );
              }}
            />
          </div>
        </form>
        <IconDropDown />
      </div>
      <div className="text-4xl font-bold !min-w-[15rem] pb-4 pt-4">
        Templates
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex flex-row gap-2 h-[10rem] mb-6">
          {(searchTemplates.length ? searchTemplates : templates).map(
            (template) => (
              <button
                key={template.id}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent min-w-[20rem]',
                  boardMeta.id === template.id && 'bg-muted',
                )}
                onClick={async () => {
                  const isSelected = boardMeta.id === template.id;

                  try {
                    if (!isSelected) {
                      setIsLoading(true);
                      const boardState = await axios.get(REST.template.get, {
                        params: { id: template.id },
                      });

                      const state = createStateWithRoughElement(
                        boardState.data.template.serialized.serialized,
                      );

                      setState(state);

                      const canvas = renderElementsOnOffscreenCanvas(
                        state.allIds,
                        {
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
                        },
                      );

                      setThumbnailUrl(canvas?.toDataURL('image/png') ?? '');
                      setIsLoading(false);
                    }

                    setBoardMeta({
                      title: isSelected ? '' : template.title,
                      id: isSelected ? '' : template.id,
                    });
                  } catch (error) {
                    console.log('Error fetching template:', error);
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
                      <div className="font-semibold">{template.title}</div>
                    </div>
                  </div>
                </div>
              </button>
            ),
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {boardMeta.id &&
        board === 'Templates' &&
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
          <TemplateThumbnail
            setState={setCanvasState}
            thumbnail={thumbnailUrl}
          />
        ))}
    </div>
  );
};
