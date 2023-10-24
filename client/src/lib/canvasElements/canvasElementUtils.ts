import { CanvasElement } from '@/stores/CanvasElementsStore';
import { generator } from './generator';
import { CanvasElementType } from '@/types';

// TODO: Want an inheritance approach with creation/editing.

const stroke = '#000000';
const fill = '#000000';
const bowing = 0;
const roughness = 0;
const strokeWidth = 3;
const fillStyle = 'hachure';
const strokeLineDash = [0];
const opacity = 1;

const defaultOptions = {
  stroke,
  fill,
  bowing,
  roughness,
  strokeWidth,
  fillStyle,
  strokeLineDash,
};

// Temporary
const createElement = (
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: CanvasElementType,
  options = defaultOptions,
): CanvasElement => {
  const roughElement =
    type === 'line'
      ? generator.line(x1, y1, x2, y2, options)
      : // Rectangle takes w, h as last two params
        generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);

  return {
    id,
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
    type,
    strokeColor: stroke,
    fillColor: fill,
    bowing,
    roughness,
    strokeWidth,
    fillStyle,
    strokeLineDash,
    opacity,
    roughElement,
  };
};

export { createElement };
