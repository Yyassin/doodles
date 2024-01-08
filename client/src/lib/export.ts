import { CanvasElement } from '@/stores/CanvasElementsStore';
import jsPDF from 'jspdf';
import { renderCanvasElements } from './canvasElements/renderScene';
import { getOrientedBounds } from './math';
import { Vector2 } from '@/types';

/**
 * Defines helpers for exporting canvas contents.
 * @authors Dana El Sherif, Yousef Yassin
 */

/**
 * Handles the export of a canvas data URL as a PNG file.
 * @param dataURL The data URL representing the canvas image.
 */
export const handlePNGExport = (dataURL: string) => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'canvas.png';
  link.click();
  // Cleanup
  // document.removeChild(link);
};

/**
 * Handles the export of a canvas data URL as a PDF file.
 * @param dataURL The data URL representing the canvas image.
 */
export const handlePDFExport = (dataURL: string) => {
  const pdf = new jsPDF('portrait');
  pdf.addImage(dataURL, 'PNG', 15, 15, 190, 130);
  pdf.save('canvas.pdf');
};

/**
 * Renders specified canvas elements on an offscreen canvas and returns the canvas.
 *
 * @param elementIds The IDs of the elements to render.
 * @param appState The application state containing information about canvas elements.
 * @param options Optional rendering options, such as margin, fill color, and text rendering predicate.
 * @returns The offscreen canvas containing the rendered elements.
 */
export const renderElementsOnOffscreenCanvas = (
  elementIds: string[],
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    angles: Record<string, CanvasElement['angle']>;
    types: Record<string, CanvasElement['type']>;
    fillColors: Record<string, CanvasElement['fillColor']>;
    fontFamilies: Record<string, CanvasElement['fontFamily']>;
    fontSizes: Record<string, CanvasElement['fontSize']>;
    freehandPoints: Record<string, CanvasElement['freehandPoints']>;
    freehandBounds: Record<string, [Vector2, Vector2]>;
    textStrings: Record<string, CanvasElement['text']>;
    isImagePlaceds: Record<string, CanvasElement['isImagePlaced']>;
    fileIds: Record<string, CanvasElement['fileId']>;
    roughElements: Record<string, CanvasElement['roughElement']>;
    opacities: Record<string, CanvasElement['opacity']>;
    strokeColors: Record<string, CanvasElement['strokeColor']>;
    strokeWidths: Record<string, CanvasElement['strokeWidth']>;
  },
  options?: {
    margin: number;
    canvasColor: string;
    renderTextPredicate?: (id: string) => boolean;
  },
) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx === null) return;

  const {
    p1,
    p2,
    angles,
    types,
    fillColors,
    fontFamilies,
    fontSizes,
    freehandPoints,
    freehandBounds,
    textStrings,
    isImagePlaceds,
    fileIds,
    roughElements,
    opacities,
    strokeColors,
    strokeWidths,
  } = appState;

  const margin = options?.margin ?? 0;
  let [minX, maxX, minY, maxY] = [Infinity, 0, Infinity, 0];

  elementIds
    .filter((id) => p1[id] !== undefined && p2[id] !== undefined)
    .forEach((id) => {
      let { x: x1, y: y1 } = p1[id];
      let { x: x2, y: y2 } = p2[id];
      const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
      ({ x1, y1, x2, y2 } = getOrientedBounds(
        { x1, x2, y1, y2 },
        [cx, cy],
        angles[id],
      ));

      minX = Math.min(minX, x1, x2);
      maxX = Math.max(maxX, x1, x2);
      minY = Math.min(minY, y1, y2);
      maxY = Math.max(maxY, y1, y2);
    });
  const [width, height] = [maxX - minX + 2 * margin, maxY - minY + 2 * margin];
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.save();
  ctx.fillStyle = options?.canvasColor || 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  renderCanvasElements(
    canvas,
    ctx,
    {
      elementIds,
      p1,
      p2,
      angles,
      types,
      fillColors,
      fontFamilies,
      fontSizes,
      freehandPoints,
      freehandBounds,
      textStrings,
      isImagePlaceds,
      fileIds,
      roughElements,
      opacities,
      strokeColors,
      strokeWidths,
    },
    {
      x: minX - margin,
      y: minY - margin,
    },
    options?.renderTextPredicate,
  );

  return canvas;
};
