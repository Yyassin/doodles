import { ObjectValues } from '@/lib/misc';
import { useAppStore } from '@/stores/AppStore';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { useLayoutEffect } from 'react';
import rough from 'roughjs';

export type TransformHandleDirection =
  | 'n'
  | 's'
  | 'w'
  | 'e'
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se';

export type TransformHandleType = TransformHandleDirection | 'rotation';

export type TransformHandle = [number, number, number, number];
export type TransformHandles = Partial<{
  [T in TransformHandleType]: TransformHandle;
}>;

// Rotate line from x1, y1
export const rotate = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  angle: number,
): [number, number] =>
  // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
  // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
  // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
  [
    (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
  ];

const zoomValue = 1;
const selectionColour = '#818cf8';

const fillCircle = (
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  stroke = true,
) => {
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  if (stroke) {
    context.stroke();
  }
};

const strokeRectWithRotation = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  radius = 3,
) => {
  ctx.save();
  ctx.rotate(angle);

  if (radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.stroke();
    ctx.closePath();
  } else {
    ctx.strokeRect(x, y, width, height);
  }
  ctx.restore();
};

const renderSelectionBorder = (
  ctx: CanvasRenderingContext2D,
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
  },
  selection: string,
) => {
  const { p1, p2 } = appState;
  const { x: elementX1, y: elementY1 } = p1[selection];
  const { x: elementX2, y: elementY2 } = p2[selection];

  const elementWidth = elementX2 - elementX1;
  const elementHeight = elementY2 - elementY1;

  const linePadding = 6 / zoomValue;

  ctx.save();
  ctx.strokeStyle = selectionColour;
  ctx.lineWidth = 2 / zoomValue;
  strokeRectWithRotation(
    ctx,
    elementX1 - linePadding,
    elementY1 - linePadding,
    elementWidth + linePadding * 2,
    elementHeight + linePadding * 2,
    0,
  );
};

const generateTransformHandle = (
  x: number,
  y: number,
  width: number,
  height: number,
  cx: number,
  cy: number,
  angle = 0,
): TransformHandle => {
  const [xx, yy] = rotate(x + width / 2, y + height / 2, cx, cy, angle);
  return [xx - width / 2, yy - height / 2, width, height];
};

const getTransformHandlesFromCoords = (
  appState: {
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
  },
  selection: string,
  omitSides: { [T in TransformHandleType]?: boolean } = {},
) => {
  const { p1, p2 } = appState;
  const { x: x1, y: y1 } = p1[selection];
  const { x: x2, y: y2 } = p2[selection];

  const size = 8;
  const handleWidth = size / zoomValue;
  const handleHeight = size / zoomValue;

  const handleMarginX = size / zoomValue;
  const handleMarginY = size / zoomValue;

  const width = x2 - x1;
  const height = y2 - y1;
  // For rect only for now
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  // Fixed for now
  const angle = 0;

  // Line padding - half height
  const dashedLineMargin = 6 / zoomValue - handleHeight / 2;
  const centeringOffset = 0;

  const transformHandles: TransformHandles = {
    nw: omitSides.nw
      ? undefined
      : generateTransformHandle(
          x1 - dashedLineMargin - handleMarginX + centeringOffset,
          y1 - dashedLineMargin - handleMarginY + centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    ne: omitSides.ne
      ? undefined
      : generateTransformHandle(
          x2 + dashedLineMargin - centeringOffset,
          y1 - dashedLineMargin - handleMarginY + centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    sw: omitSides.sw
      ? undefined
      : generateTransformHandle(
          x1 - dashedLineMargin - handleMarginX + centeringOffset,
          y2 + dashedLineMargin - centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    se: omitSides.se
      ? undefined
      : generateTransformHandle(
          x2 + dashedLineMargin - centeringOffset,
          y2 + dashedLineMargin - centeringOffset,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
    rotation: omitSides.rotation
      ? undefined
      : generateTransformHandle(
          x1 + width / 2 - handleWidth / 2,
          y1 -
            dashedLineMargin -
            handleMarginY +
            centeringOffset -
            16 / zoomValue,
          handleWidth,
          handleHeight,
          cx,
          cy,
          angle,
        ),
  };

  const transformHandleSizes = 8;
  const minimumSizeForEightHandles = (5 * transformHandleSizes) / zoomValue;
  if (Math.abs(width) > minimumSizeForEightHandles) {
    if (!omitSides.n) {
      transformHandles.n = generateTransformHandle(
        x1 + width / 2 - handleWidth / 2,
        y1 - dashedLineMargin - handleMarginY + centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
    if (!omitSides.s) {
      transformHandles.s = generateTransformHandle(
        x1 + width / 2 - handleWidth / 2,
        y2 + dashedLineMargin - centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
  }
  if (Math.abs(height) > minimumSizeForEightHandles) {
    if (!omitSides.w) {
      transformHandles.w = generateTransformHandle(
        x1 - dashedLineMargin - handleMarginX + centeringOffset,
        y1 + height / 2 - handleHeight / 2,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
    if (!omitSides.e) {
      transformHandles.e = generateTransformHandle(
        x2 + dashedLineMargin - centeringOffset,
        y1 + height / 2 - handleHeight / 2,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
  }

  return transformHandles;
};

const renderTransformHandles = (
  ctx: CanvasRenderingContext2D,
  transformHandles: TransformHandles,
) => {
  Object.keys(transformHandles).forEach((key) => {
    const transformHandle = transformHandles[key as TransformHandleType];
    if (transformHandle !== undefined) {
      const [x, y, width, height] = transformHandle;

      ctx.save();
      ctx.lineWidth = 1 / zoomValue;
      ctx.strokeStyle = selectionColour;

      if (key === 'rotation') {
        fillCircle(ctx, x + width / 2, y + height / 2, width / 2);
        // prefer round corners if roundRect API is available
      } else {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 2 / zoomValue);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  });
};

/**
 * Hook that's subscribed to the roughElements
 * state and will trigger a rerender, redrawing all elements,
 * whenever an element is updated.
 * @author Yousef Yassin
 */
const useDrawElements = () => {
  const { appHeight, appWidth } = useAppStore(['appHeight', 'appWidth']);
  const { roughElements, selectedElementId, p1, p2, types } =
    useCanvasElementStore([
      'roughElements',
      'selectedElementId',
      'p1',
      'p2',
      'types',
    ]);

  // Effect fires after DOM is mounted
  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas === null) return;

    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    // Clear on each rerender
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);

    // Render each element
    ObjectValues(roughElements).forEach((roughElement) =>
      roughCanvas.draw(roughElement),
    );

    if (selectedElementId === '' || types[selectedElementId] === 'line') return;

    const selectedElementIds = [selectedElementId];

    selectedElementIds.forEach((selection) => {
      renderSelectionBorder(ctx, { p1, p2 }, selection);
    });

    const transformHandles = getTransformHandlesFromCoords(
      { p1, p2 },
      selectedElementId,
      { rotation: true },
    );
    renderTransformHandles(ctx, transformHandles);
  }, [roughElements, selectedElementId, types, p1, p2, appWidth, appHeight]);
};

export default useDrawElements;
