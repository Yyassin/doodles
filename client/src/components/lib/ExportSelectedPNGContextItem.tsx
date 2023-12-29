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
    textStrings,
    fileIds,
    isImagePlaceds,
    angles,
  } = useCanvasElementStore([
    'selectedElementIds',
    'p1',
    'p2',
    'types',
    'freehandPoints',
    'textStrings',
    'fileIds',
    'isImagePlaceds',
    'angles',
  ]);
  return (
    <ContextMenuItem
      // eslint-disable-next-line sonarjs/cognitive-complexity
      onClick={() => {
        const canvas = renderElementsOnOffscreenCanvas(
          selectedElementIds,
          {
            p1,
            p2,
            angles,
            types,
            freehandPoints,
            textStrings,
            isImagePlaceds,
            fileIds,
          },
          { margin: 20, fillColour: 'white' },
        );
        canvas && handlePNGExport(canvas.toDataURL('image/png'));
      }}
    >
      Export as PNG{' '}
      <div className="ml-auto pl-5 text-violet-700 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
        <ImageIcon />
      </div>
    </ContextMenuItem>
  );
};

export default ExportSelectedPNGContextItem;
