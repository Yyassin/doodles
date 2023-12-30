import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import React from 'react';
import { ImageIcon } from '@radix-ui/react-icons';
import { handlePNGExport, renderElementsOnOffscreenCanvas } from '@/lib/export';
import ContextMenuItem from './ContextMenuItem';

/**
 * Context Menu options that supports exporting only selected
 * items as a PNG image.
 * @author Yousef Yassin
 */

const ExportSelectedPNGContextItem = () => {
  const {
    selectedElementIds,
    p1,
    p2,
    types,
    freehandPoints,
    freehandBounds,
    textStrings,
    fileIds,
    isImagePlaceds,
    angles,
    roughElements,
  } = useCanvasElementStore([
    'selectedElementIds',
    'p1',
    'p2',
    'types',
    'freehandPoints',
    'freehandBounds',
    'textStrings',
    'fileIds',
    'isImagePlaceds',
    'angles',
    'roughElements',
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
            isImagePlaceds,
            fileIds,
            roughElements,
          },
          { margin: 20, fillColour: 'white' },
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
