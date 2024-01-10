import { getOrientedBounds } from '@/lib/math';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { useEffect } from 'react';

/**
 * Hook that subscribes to the selection element and computes
 * the selected elements on every change.
 * @author Yousef Yassin
 */

const useMultiSelection = () => {
  const { selectionFrame, setSelectedElements, allIds, p1, p2, angles } =
    useCanvasElementStore([
      'selectionFrame',
      'setSelectedElements',
      'allIds',
      'p1',
      'p2',
      'angles',
    ]);

  useEffect(() => {
    if (selectionFrame === null) return;

    const elementsWithinSelection = getElementsWithinFrame(
      { elementIds: allIds, p1, p2, angles },
      selectionFrame,
    );
    setSelectedElements(elementsWithinSelection);
  }, [selectionFrame, allIds, p1, p2]);
};

/**
 * Retrieves element IDs within a specified frame in the canvas.
 *
 * @param appState The application state containing element IDs, and positions (p1, p2) of canvas elements.
 * @param frame The frame represented by its top-left (p1) and bottom-right (p2) coordinates.
 * @returns An array of element IDs that fall within the specified frame.
 */
const getElementsWithinFrame = (
  appState: {
    elementIds: string[];
    p1: Record<string, CanvasElement['p1']>;
    p2: Record<string, CanvasElement['p2']>;
    angles: Record<string, CanvasElement['angle']>;
  },
  frame: {
    p1: CanvasElement['p1'];
    p2: CanvasElement['p2'];
  },
) => {
  // Destructure properties from appState
  const { elementIds, p1, p2, angles } = appState;

  // Destructure coordinates of the frame
  let { x: frameX1, y: frameY1 } = frame.p1;
  let { x: frameX2, y: frameY2 } = frame.p2;

  // Adjust the coordinates so that x1 < x2 and y1 < y2
  // this is needed in case we draw the frame from right to left or bottom to top and
  // simplifies the logic of checking whether an element is within the frame
  [frameX1, frameX2] = [frameX1, frameX2].sort((a, b) => a - b);
  [frameY1, frameY2] = [frameY1, frameY2].sort((a, b) => a - b);

  // Filter element IDs based on whether their positions fall within the frame
  return elementIds.filter((id) => {
    let { x: x1, y: y1 } = p1[id];
    let { x: x2, y: y2 } = p2[id];

    const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
    ({ x1, y1, x2, y2 } = getOrientedBounds(
      { x1, x2, y1, y2 },
      [cx, cy],
      angles[id],
    ));

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // Check if the element is within the frame boundaries
    return (
      frameX1 <= minX && frameY1 <= minY && frameX2 >= maxX && frameY2 >= maxY
    );
  });
};

export default useMultiSelection;
