import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import ToolGroup, { colourTypes } from './ChangeColor';
import StrokeToolGroup, { strokeTypes } from './ChangeThickness';
import StrokeColorToolGroup, { strokeColourTypes } from './ChangeStrokeColor';
import RoughnessToolGroup, { roughnessTypes } from './ChangeRoughness';
import { CanvasElementFillStyles } from '@/types';
import FillStyleToolGroup from './ChangeFillStyle';
import OpacitySlider from './ChangeOpacity';
import FontFamily, { fontTypes } from './ChangeFont';

/**
 * This file defines the CustomToolbar component, which is the main toolbar displayed
 * on the canvas. It includes tool groups for changing the color, stroke thickness,
 * stroke color, roughness, fill style, and opacity of the selected canvas element.
 * Each tool group is imported from its respective file, and the available options for
 * each tool group are defined in the respective arrays (e.g., `colourTypes`, `strokeTypes`, etc.).
 * @author Eebro
 */

/**
 * The toolbar that is displayed on the canvas.
 */
const CustomToolbar = () => {
  return (
    <Toolbar.Root className="p-[0.3rem] gap-[0.3rem] min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] mt-40 absolute ml-3">
      {/* Background Color */}
      <h2 className="text-sm font-semibold mb-2">Color</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <ToolGroup tools={[...colourTypes]} />
      {/* Text Font */}
      <h2 className="text-sm font-semibold mb-2">Font</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <FontFamily tools={[...fontTypes]} />
      {/* Stroke Thickness */}
      <h2 className="text-sm font-semibold mb-2">Stroke Thickness</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <StrokeToolGroup tools={[...strokeTypes]} />
      {/* Stroke Color (border for shapes) */}
      <h2 className="text-sm font-semibold mb-2">Stroke Color</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <StrokeColorToolGroup tools={[...strokeColourTypes]} />
      {/* Stroke Thickness */}
      <h2 className="text-sm font-semibold mb-2">Roughness</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <RoughnessToolGroup tools={[...roughnessTypes]} />
      {/* Fill Style */}
      <h2 className="text-sm font-semibold mb-2">Fill Style</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <FillStyleToolGroup tools={[...CanvasElementFillStyles]} />
      {/* Opacity */}
      <h2 className="text-sm font-semibold mb-2">Opacity</h2>{' '}
      <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
      <OpacitySlider />
    </Toolbar.Root>
  );
};

export default CustomToolbar;
