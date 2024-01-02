import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import ToolGroup, { colourType } from './ChangeColor';
import StrokeToolGroup, { strokeType } from './ChangeThickness';
import StrokeColorToolGroup, { strokeColourType } from './ChangeStrokeColor';

/**
 * The toolbar that is displayed on the canvas.
 */
const CustomToolbar = () => {
  return (
    <Toolbar.Root className="p-[0.3rem] gap-[0.3rem] min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] mt-40 absolute ml-3">
      {/* Background Color */}
      <h2 className="text-sm font-semibold mb-2">Color</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <ToolGroup
        tools={
          [
            'redCircle',
            'greenCircle',
            'blueCircle',
            'orangeCircle',
            'blackCircle',
          ] as colourType[]
        }
      />
      {/* Stroke Thickness */}
      <h2 className="text-sm font-semibold mb-2">Stroke Thickness</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <StrokeToolGroup tools={['thin', 'bold', 'extraBold'] as strokeType[]} />
      {/* Stroke Color (border for shapes) */}
      <h2 className="text-sm font-semibold mb-2">Stroke Color</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <StrokeColorToolGroup
        tools={
          [
            'redCircle',
            'greenCircle',
            'blueCircle',
            'orangeCircle',
            'blackCircle',
          ] as strokeColourType[]
        }
      />
    </Toolbar.Root>
  );
};

export default CustomToolbar;
