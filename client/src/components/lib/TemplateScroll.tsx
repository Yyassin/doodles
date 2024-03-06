import React, { useEffect, useState } from 'react';
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
import { set } from 'lodash';

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

  const setCanvasState = async () => {
    if (state === undefined) return;
    setCanvasElementState(state);
    console.log('may god have mercy on my soul');

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
    <div className="relative flex flex-col mx-2 h-full">
      <div className="w-full h-[250px] overflow-x-scroll scroll whitespace-nowrap scroll-smooth">
        {templates.map((template) => (
          <div
            key={template.id}
            className={
              'relative w-[500px] h-[200px] rounded-md inline-block mx-3 mt-4 cursor-pointer hover:scale-105 ease-in-out duration-300 ' +
              (boardMeta.id === template.id ? 'bg-[#7f7dcf]' : 'bg-[#ebebeb]')
            }
            onClick={async () => {
              const isSelected = boardMeta.id === template.id;

              try {
                if (!isSelected) {
                  const boardState = await axios.get(REST.template.get, {
                    params: { id: template.id },
                  });

                  const state = createStateWithRoughElement(
                    boardState.data.template.serialized.serialized,
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
            {template.title}
          </div>
        ))}
      </div>
      {boardMeta.id && board === 'Templates' && (
        <TemplateThumbnail setState={setCanvasState} thumbnail={thumbnailUrl} />
      )}
    </div>
  );
};
