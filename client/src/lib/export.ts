import { CanvasElement } from '@/stores/CanvasElementsStore';
import jsPDF from 'jspdf';
import { renderCanvasElements } from './canvasElements/renderScene';

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
    freehandPoints: Record<string, CanvasElement['freehandPoints']>;
    textStrings: Record<string, CanvasElement['text']>;
    isImagePlaceds: Record<string, CanvasElement['isImagePlaced']>;
    fileIds: Record<string, CanvasElement['fileId']>;
  },
  options?: {
    margin: number;
    fillColour: string;
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
    freehandPoints,
    textStrings,
    isImagePlaceds,
    fileIds,
  } = appState;

  const margin = options?.margin ?? 0;
  let [minX, maxX, minY, maxY] = [Infinity, 0, Infinity, 0];
  elementIds.forEach((id) => {
    minX = Math.min(minX, p1[id].x);
    maxX = Math.max(maxX, p2[id].x);
    minY = Math.min(minY, p1[id].y);
    maxY = Math.max(maxY, p2[id].y);
  });
  const [width, height] = [maxX - minX + 2 * margin, maxY - minY + 2 * margin];
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.save();
  options?.fillColour && (ctx.fillStyle = options.fillColour);
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
      freehandPoints,
      textStrings,
      isImagePlaceds,
      fileIds,
    },
    {
      x: minX - margin,
      y: minY - margin,
    },
    options?.renderTextPredicate,
  );

  return canvas;
};
