import React, { useState } from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
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

/**
 * Define a react component that all the user's boards in a folder
 * @author Abdalla Abdelhadi
 */

export const BoardScroll = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [state, setState] = useState<CanvasElementState>();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const { canvases, boardMeta, setBoardMeta } = useCanvasBoardStore([
    'canvases',
    'boardMeta',
    'setBoardMeta',
  ]);
  const { setCanvasElementState } = useCanvasElementStore([
    'setCanvasElementState',
  ]);

  const setCanvasState = () => {
    if (!state) return;
    setCanvasElementState(state);
  };

  return (
    <div className="relative flex flex-col mx-2 h-full">
      <div className="w-full h-[250px] overflow-x-scroll scroll whitespace-nowrap scroll-smooth">
        {canvases.map((board) => (
          <div
            key={board.id}
            className={
              'relative w-[500px] h-[200px] rounded-md inline-block mx-3 mt-4 cursor-pointer hover:scale-105 ease-in-out duration-300 ' +
              (boardMeta.id === board.id ? 'bg-[#7f7dcf]' : 'bg-[#ebebeb]')
            }
            onClick={async () => {
              const selected = boardMeta.id === board.id;

              if (!selected) {
                const boardState = await axios.get(REST.board.getBoard, {
                  params: { id: board.id },
                });

                const state: CanvasElementState =
                  boardState.data.board.serialized;

                const roughElements: Record<
                  string,
                  CanvasElement['roughElement']
                > = {};

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

                setThumbnailUrl(
                  canvas === undefined ? '' : canvas.toDataURL('image/png'),
                );
              }
              // TODO: Should perform and cache concurrent fetches for the board and its comments here
              setBoardMeta({
                roomID: selected ? '' : board.roomID,
                title: selected ? '' : board.title,
                id: selected ? '' : board.id,
                lastModified: selected ? '' : board.updatedAt,
              });
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
