import { CanvasElement } from '@/stores/CanvasElementsStore';
import { generator } from './generator';
import { CanvasElementType, Vector2 } from '@/types';

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
  opacity,
  text: '',
};

// Temporary
const createElement = (
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: CanvasElementType,
  points?: Vector2[],
  options = defaultOptions,
  isLive = false,
): CanvasElement => {
  let roughElement;
  let newPoints;
  if (points === undefined) {
    switch (type) {
      case 'line':
        roughElement = generator.line(x1, y1, x2, y2, options);
        break;
      case 'rectangle':
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
        break;
      case 'circle':
        const diameter =
          2 * Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        roughElement = generator.ellipse(x1, y1, diameter, diameter, options);
        break;
      default:
        null;
    }
  } else {
    newPoints = isLive ? points : [...points, { x: x2, y: y2 }];
  }

  return {
    id,
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
    type,
    strokeColor: options.stroke,
    fillColor: options.fill,
    bowing,
    roughness,
    strokeWidth,
    fillStyle,
    strokeLineDash,
    opacity,
    roughElement,
    text: options.text,
    freehandPoints: newPoints,
    isImagePlaced: false,
  };
};

export { createElement };
