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
import SizeOptions, { sizes } from './ChangeSize';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useAppStore } from '@/stores/AppStore';

/**
 * This file defines the CustomToolbar component, which is the main toolbar displayed
 * on the canvas. It includes tool groups for changing the color, stroke thickness,
 * stroke color, roughness, fill style, and opacity of the selected canvas element.
 * Each tool group is imported from its respective file, and the available options for
 * each tool group are defined in the respective arrays (e.g., `colourTypes`, `strokeTypes`, etc.).
 * @author Eebro, Dana El Sherif
 */

//Sets of element types each component should be available for
const fontSizeSet = new Set(['text']);
const opacitySet = new Set([
  'text',
  'freehand',
  'rectangle',
  'circle',
  'line',
  'image',
]);
const fillColorSet = new Set(['rectangle', 'circle', 'line']);
const strokeThicknessSet = new Set(['freehand', 'rectangle', 'circle', 'line']);
const strokeColorSet = new Set([
  'freehand',
  'rectangle',
  'circle',
  'line',
  'text',
]);
const strokeRoughnessSet = new Set(['rectangle', 'circle', 'line']);
const fillStyleSet = new Set(['rectangle', 'circle', 'line']);

/**
 * The toolbar that is displayed on the canvas.
 */
const CustomToolbar = () => {
  const { tool } = useAppStore(['tool']);
  const { types, selectedElementIds } = useCanvasElementStore([
    'types',
    'selectedElementIds',
  ]);
  return (
    <Toolbar.Root className="p-[0.3rem] gap-[0.3rem] min-w-max rounded-lg bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] mt-40 absolute ml-3 z-10">
      {/* Stroke Color */}
      {(strokeColorSet.has(types[selectedElementIds[0]]) ||
        strokeColorSet.has(tool)) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Stroke Color</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <StrokeColorToolGroup tools={[...strokeColourTypes]} />
        </>
      )}
      {/* Text Font */}
      {(fontSizeSet.has(types[selectedElementIds[0]]) ||
        fontSizeSet.has(tool)) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Font</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <FontFamily tools={[...fontTypes]} />
        </>
      )}
      {/* Text Size */}
      {(fontSizeSet.has(types[selectedElementIds[0]]) ||
        fontSizeSet.has(tool)) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Size</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <SizeOptions tools={[...sizes]} />
        </>
      )}
      {/* Stroke Thickness */}
      {(strokeThicknessSet.has(types[selectedElementIds[0]]) ||
        strokeThicknessSet.has(tool)) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Stroke Thickness</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <StrokeToolGroup tools={[...strokeTypes]} />
        </>
      )}
      {/* Stroke Roughness */}
      {(strokeRoughnessSet.has(types[selectedElementIds[0]]) ||
        strokeRoughnessSet.has(tool)) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Roughness</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <RoughnessToolGroup tools={[...roughnessTypes]} />
        </>
      )}
      {/* Fill Color */}
      {(fillColorSet.has(types[selectedElementIds[0]]) ||
        fillColorSet.has(tool)) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Fill Color</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <ToolGroup tools={[...colourTypes]} />
        </>
      )}
      {/* Fill Style */}
      {(fillStyleSet.has(types[selectedElementIds[0]]) ||
        fillStyleSet.has(tool)) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Fill Style</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <FillStyleToolGroup tools={[...CanvasElementFillStyles]} />
        </>
      )}
      {/* Opacity */}
      {(opacitySet.has(types[selectedElementIds[0]]) || opacitySet) && (
        <>
          <h2 className="text-sm font-semibold mb-2">Opacity</h2>{' '}
          <Toolbar.Separator className="w-[1px] bg-neutral-200 mx-[0.2rem]" />
          <OpacitySlider />
        </>
      )}
    </Toolbar.Root>
  );
};

export default CustomToolbar;
