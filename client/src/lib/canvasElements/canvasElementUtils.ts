import { CanvasElement } from '@/stores/CanvasElementsStore';
import { generator } from './generator';
import { CanvasElementFillStyle, CanvasElementType, Vector2 } from '@/types';

const stroke = '#000000';
const fill = undefined as string | undefined;
const bowing = 0;
const roughness = 0.01;
const strokeWidth = 3;
const fillStyle = 'none' as CanvasElementFillStyle;
const strokeLineDash = [0];
const opacity = 1;
const angle = 0;
const font = 'trebuchet MS';
const size = 24;

export const defaultOptions = {
  stroke,
  font,
  size,
  fill,
  bowing,
  roughness,
  strokeWidth,
  fillStyle,
  strokeLineDash,
  opacity,
  text: '',
  angle,
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
  options: Partial<typeof defaultOptions> = defaultOptions,
  isLive = false,
): CanvasElement => {
  let roughElement;
  let newPoints;
  options.fill =
    options.fillStyle === 'none' ? undefined : options.fill ?? '#000000';

  if (points === undefined) {
    switch (type) {
      case 'line':
        roughElement = generator.line(x1, y1, x2, y2, options);
        break;
      case 'rectangle':
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
        break;
      case 'circle':
        const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
        const [width, height] = [x2 - x1, y2 - y1];
        [x1, y1] = [cx - width / 2, cy - height / 2];
        [x2, y2] = [cx + width / 2, cy + height / 2];
        roughElement = generator.ellipse(cx, cy, width, height, options);
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
    ...defaultOptions,
    strokeColor: options.stroke ? options.stroke : defaultOptions.stroke,
    fontFamily: options.font ? options.font : defaultOptions.font,
    fontSize: options.size ? options.size : defaultOptions.size,
    fillColor: options.fill,
    ...options,
    roughElement,
    freehandPoints: newPoints,
    isImagePlaced: false,
  };
};

export { createElement };
