import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import React from 'react';
import { ImageIcon } from '@radix-ui/react-icons';
import { handlePNGExport, renderElementsOnOffscreenCanvas } from '@/lib/export';
import ContextMenuItem from './ContextMenuItem';
import { useAppStore } from '@/stores/AppStore';

/**
 * Context Menu options that supports exporting only selected
 * items as a PNG image.
 * @author Yousef Yassin
 */

const ExportSelectedPNGContextItem = () => {
  const { canvasColor } = useAppStore(['canvasColor']);
  const {
    selectedElementIds,
    p1,
    p2,
    types,
    freehandPoints,
    freehandBounds,
    textStrings,
    fontFamilies,
    fontSizes,
    fillColors,
    fileIds,
    isImagePlaceds,
    angles,
    roughElements,
    opacities,
    strokeColors,
    strokeWidths,
  } = useCanvasElementStore([
    'selectedElementIds',
    'p1',
    'p2',
    'types',
    'freehandPoints',
    'freehandBounds',
    'textStrings',
    'fontFamilies',
    'fontSizes',
    'fillColors',
    'fileIds',
    'isImagePlaceds',
    'angles',
    'roughElements',
    'opacities',
    'strokeColors',
    'strokeWidths',
  ]);
  return (
    <ContextMenuItem
      className="text-violet-500"
      onClick={() => {
        const canvas = renderElementsOnOffscreenCanvas(
          selectedElementIds,
          {
            p1,
            p2,
            angles,
            types,
            freehandPoints,
            freehandBounds,
            textStrings,
            fontFamilies,
            fontSizes,
            fillColors,
            isImagePlaceds,
            fileIds,
            roughElements,
            opacities,
            strokeColors,
            strokeWidths,
          },
          {
            margin: 20,
            canvasColor,
          },
        );
        canvas && handlePNGExport(canvas.toDataURL('image/png'));
      }}
    >
      Export as PNG{' '}
      <div className="ml-auto pl-5 text-violet-500 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
        <ImageIcon />
      </div>
    </ContextMenuItem>
  );
};

export default ExportSelectedPNGContextItem;
