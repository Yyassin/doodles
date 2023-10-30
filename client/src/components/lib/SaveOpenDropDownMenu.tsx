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
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    p1,
    p2,
  } = useCanvasElementStore([
    'setCanvasElementState',
    'allIds',
    'types',
    'strokeColors',
    'fillColors',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'p1',
    'p2',
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
      const state: CanvasElementState = JSON.parse(reader.result as string);
      const roughElements: Record<string, CanvasElement['roughElement']> = {};

      //create the roughElements
      for (const [key, type] of Object.entries(state.types)) {
        const options = {
          stroke: state.strokeColors[key],
          fill: state.fillColors[key],
          bowing: state.bowings[key],
          roughness: state.roughnesses[key],
          strokeWidth: state.strokeWidths[key],
          fillStyle: state.fillStyles[key],
          strokeLineDash: state.strokeLineDashes[key],
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
      setCanvasElementState(state);
    };
  };

  /**
   * Serializes the data and saves it to local disk
   */
  const handleSave = () => {
    const serializedState = JSON.stringify({
      allIds,
      types,
      strokeColors,
      fillColors,
      bowings,
      roughnesses,
      strokeWidths,
      fillStyles,
      strokeLineDashes,
      opacities,
      p1,
      p2,
    });

    const blob = new Blob([serializedState], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, 'test.txt'); //change name later
  };

  return (
    <React.Fragment>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt"
        onChange={handleOpen}
      />

      <button
        className="group w-full text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
        onClick={invokeInput}
      >
        <EnvelopeOpenIcon /> Open
      </button>

      <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
      <DropdownMenu.Item
        className="group text-[13px] indent-[10px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-teal-500"
        onClick={handleSave}
      >
        <DownloadIcon /> Save
      </DropdownMenu.Item>
    </React.Fragment>
  );
};
