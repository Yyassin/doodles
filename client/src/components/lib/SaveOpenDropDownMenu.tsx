import React, { SyntheticEvent, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { EnvelopeOpenIcon, DownloadIcon } from '@radix-ui/react-icons';
import {
  CanvasElement,
  CanvasElementState,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import saveAs from 'file-saver';
import { fileCache } from '@/lib/cache';
import { BinaryFileData } from '@/types';
import { commitImageToCache } from '@/lib/image';

/**
 * Component that the save and load button with their functionality in the drop down menu in the canavas
 *
 * @author Abdalla Abdelhadi
 */

export const SaveOpenDropDownMenu = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    setCanvasElementState,
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
    editCanvasElement,
    textStrings,
    isImagePlaceds,
    freehandBounds,
    angles,
    fileIds,
  } = useCanvasElementStore([
    'setCanvasElementState',
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
    'editCanvasElement',
    'textStrings',
    'isImagePlaceds',
    'freehandBounds',
    'angles',
    'fileIds',
  ]);

  /**
   * Invokes the input elment
   */
  const invokeInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  /**
   * Loads the txt file, deserializes the info, and updates the state in CanvasElementsStore
   *
   * @param e The event
   */
  const handleOpen = (e: SyntheticEvent) => {
    const file = (e.target as HTMLInputElement).files;

    if (file === null) return;

    const reader = new FileReader();
    reader.readAsText(file[0]);

    reader.onload = () => {
      const { fileData, ...state } = JSON.parse(
        reader.result as string,
      ) as CanvasElementState & { fileData: Record<string, BinaryFileData> };

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
      // Reset all fileIds, they will get get set to show the imageswhen they resolve.
      const fileIds = state.fileIds;
      state.fileIds = {};
      setCanvasElementState(state);

      // Populate the cache and images asynchronously
      Object.entries(fileIds).forEach(([elemId, fileId]) => {
        const binary = fileId && fileData[fileId];
        if (!binary) throw new Error('Failed to resolve saved binary images');

        const imageElement = { id: elemId };
        commitImageToCache(
          {
            ...fileData[fileId],
            lastRetrieved: Date.now(),
          },
          imageElement,
          // Will set fileIds, triggering a rerender. A placeholder
          // will be shown in the mean time.
          editCanvasElement,
        );
      });
    };
  };

  /**
   * Serializes the data and saves it to local disk
   */
  const handleSave = () => {
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
      fileData: fileCache.cache,
    };
    const serializedState = JSON.stringify(state);

    const blob = new Blob([serializedState], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, 'test.txt'); //change name later
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt"
        onChange={handleOpen}
      />

      <button
        className="group w-full text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
        onClick={invokeInput}
      >
        <EnvelopeOpenIcon /> Open
      </button>

      <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
      <DropdownMenu.Item
        className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 hover:bg-indigo-200"
        onClick={handleSave}
      >
        <DownloadIcon /> Save Localy
      </DropdownMenu.Item>
    </>
  );
};
