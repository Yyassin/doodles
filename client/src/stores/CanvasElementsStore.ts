import { Drawable } from 'roughjs/bin/core';
import { SetState } from './types';
import { create } from 'zustand';
import { createStoreWithSelectors } from './utils';
import { CanvasElementFillStyle, CanvasElementType, Vector2 } from '@/types';

/**
 * Defines canvas drawable element state
 * @authors Yousef Yassin, Abdalla Abdelhadi, Dana El Sherif
 */

/**
 * General interface of a single canvas element
 */
export interface CanvasElement {
  type: CanvasElementType; // The element's type
  strokeColor: string; // Stroke color, in hex
  fillColor: string; // Inside fill color, in hex
  bowing: number; // [0, 1], specifies stroke curviness
  roughness: number; // Specified line roughness
  strokeWidth: number; // Stroke width in pixels
  fillStyle: CanvasElementFillStyle; // Pattern for filling the element
  strokeLineDash: number[]; // Array of gap width between strokes (repeats)
  opacity: number; // Element opacity -- TODO: not sure how this will work yet
  roughElement: Drawable; // The underlying roughjs element, if applicable.
  p1: Vector2; // Top left coordinate, or center for circles
  p2: Vector2; // Bottom right coordinate
  id: string; // Element id
}
// resize, and rotate
// TODO: Arrows will probably need to be composite

export interface CanvasElementState {
  selectedElementId: string;
  allIds: string[];
  types: Record<string, CanvasElement['type']>;
  strokeColors: Record<string, CanvasElement['strokeColor']>;
  fillColors: Record<string, CanvasElement['fillColor']>;
  bowings: Record<string, CanvasElement['bowing']>;
  roughnesses: Record<string, CanvasElement['roughness']>;
  strokeWidths: Record<string, CanvasElement['strokeWidth']>;
  fillStyles: Record<string, CanvasElement['fillStyle']>;
  strokeLineDashes: Record<string, CanvasElement['strokeLineDash']>;
  opacities: Record<string, CanvasElement['opacity']>;
  roughElements: Record<string, CanvasElement['roughElement']>;
  p1: Record<string, CanvasElement['p1']>;
  p2: Record<string, CanvasElement['p2']>;
}

interface CanvasElementActions {
  addCanvasElement: (element: CanvasElement) => void;
  editCanvasElement: (
    id: string,
    partialElement: Partial<CanvasElement>,
  ) => void;
  setSelectedElement: (id: string) => void;
  undoCanvasElementState: () => void;
  redoCanvasElementState: () => void;
  setCanvasElementState: (elment: CanvasElementState) => void;
}
type CanvasElementStore = CanvasElementState & CanvasElementActions;

// Initialize Canvas Element State to default state
export const initialCanvasElementState: CanvasElementState = {
  selectedElementId: '',
  allIds: [],
  types: {},
  strokeColors: {},
  fillColors: {},
  bowings: {},
  roughnesses: {},
  strokeWidths: {},
  fillStyles: {},
  strokeLineDashes: {},
  opacities: {},
  roughElements: {},
  p1: {},
  p2: {},
};
const previousStates: CanvasElementState[] = [];
const redoStates: CanvasElementState[] = [];

/* Actions */
/**
 * Adds the specified canvas element to state.
 * @param element The element to add.
 * @returns Updated state with the element added.
 */
const addCanvasElement =
  (set: SetState<CanvasElementState>) => (element: CanvasElement) =>
    set((state) => {
      const allIds = [...state.allIds];
      const types = { ...state.types };
      const strokeColors = { ...state.strokeColors };
      const fillColors = { ...state.fillColors };
      const bowings = { ...state.bowings };
      const roughnesses = { ...state.roughnesses };
      const strokeWidths = { ...state.strokeWidths };
      const fillStyles = { ...state.fillStyles };
      const strokeLineDashes = { ...state.strokeLineDashes };
      const opacities = { ...state.opacities };
      const roughElements = { ...state.roughElements };
      const p1s = { ...state.p1 };
      const p2s = { ...state.p2 };

      const {
        id,
        type,
        strokeColor,
        fillColor,
        bowing,
        roughness,
        strokeWidth,
        fillStyle,
        strokeLineDash,
        opacity,
        roughElement,
        p1,
        p2,
      } = element;
      allIds.push(id);
      types[id] = type;
      strokeColors[id] = strokeColor;
      fillColors[id] = fillColor;
      bowings[id] = bowing;
      roughnesses[id] = roughness;
      strokeWidths[id] = strokeWidth;
      fillStyles[id] = fillStyle;
      strokeLineDashes[id] = strokeLineDash;
      opacities[id] = opacity;
      roughElements[id] = roughElement;
      p1s[id] = p1;
      p2s[id] = p2;
      previousStates.push({ ...state });
      return {
        ...state,
        allIds,
        types,
        strokeColors,
        fillColors,
        bowings,
        roughnesses,
        strokeWidths,
        fillStyles,
        strokeLineDashes,
        previousStates,
        opacities,
        roughElements,
        p1: p1s,
        p2: p2s,
      };
    });

/**
 * Edits the specified canvas element in state.
 * @param id The id of the element to edit
 * @param partialElement Object containing the element's modified
 * fields -- we only update the ones that were modified.
 * @returns Updated state with the element added.
 */
const editCanvasElement =
  (set: SetState<CanvasElementState>) =>
  (id: string, partialElement: Partial<CanvasElement>) =>
    set((state) => {
      const allIds = id ? [...state.allIds, id] : state.allIds;
      const types = partialElement.type
        ? { ...state.types, [id]: partialElement.type }
        : state.types;
      const strokeColors = partialElement.strokeColor
        ? {
            ...state.strokeColors,
            [id]: partialElement.strokeColor,
          }
        : state.strokeColors;
      const fillColors = partialElement.fillColor
        ? {
            ...state.fillColors,
            [id]: partialElement.fillColor,
          }
        : state.fillColors;
      const bowings = partialElement.bowing
        ? { ...state.bowings, [id]: partialElement.bowing }
        : state.bowings;
      const roughnesses = partialElement.roughness
        ? {
            ...state.roughnesses,
            [id]: partialElement.roughness,
          }
        : state.roughnesses;
      const strokeWidths = partialElement.strokeWidth
        ? {
            ...state.strokeWidths,
            [id]: partialElement.strokeWidth,
          }
        : state.strokeWidths;
      const fillStyles = partialElement.fillStyle
        ? {
            ...state.fillStyles,
            [id]: partialElement.fillStyle,
          }
        : state.fillStyles;
      const strokeLineDashes = partialElement.strokeLineDash
        ? {
            ...state.strokeLineDashes,
            [id]: partialElement.strokeLineDash,
          }
        : state.strokeLineDashes;
      const opacities = partialElement.opacity
        ? { ...state.opacities, [id]: partialElement.opacity }
        : state.opacities;
      const roughElements = partialElement.roughElement
        ? {
            ...state.roughElements,
            [id]: partialElement.roughElement,
          }
        : state.roughElements;
      const p1s = partialElement.p1
        ? { ...state.p1, [id]: partialElement.p1 }
        : state.p1;
      const p2s = partialElement.p2
        ? { ...state.p2, [id]: partialElement.p2 }
        : state.p2;

      return {
        ...state,
        allIds,
        types,
        strokeColors,
        fillColors,
        bowings,
        roughnesses,
        strokeWidths,
        fillStyles,
        strokeLineDashes,
        opacities,
        roughElements,
        p1: p1s,
        p2: p2s,
      };
    });

/**
 * Sets the canvas state to how it was before undo
 * @returns Updated state without the undoed element.
 */
const undoCanvasElementState = (set: SetState<CanvasElementState>) => () => {
  if (previousStates.length > 0) {
    const prevState = previousStates.pop();
    if (prevState) {
      set(prevState);
      redoStates.push(prevState);
    }
  }
};

const redoCanvasElementState = (set: SetState<CanvasElementState>) => () => {
  if (redoStates.length > 0) {
    const nextState = redoStates.pop();
    if (nextState) {
      set(nextState);
      previousStates.push(nextState);
    }
  }
};
/**
 * Sets the currently selected element id.
 * @param selectedElementId The id to set as selected.
 * @returns Updated state with the selected element id.
 */
const setSelectedElement =
  (set: SetState<CanvasElementState>) => (selectedElementId: string) =>
    set(() => ({ selectedElementId }));

/**
 * Set the Canvas state to the paramter passed
 * @param newCanvasElementState The new Canvas state.
 * @returns New Canvas state
 */
const setCanvasElementState =
  (set: SetState<CanvasElementState>) =>
  (newCanvasElementState: CanvasElementState) =>
    set((state) => {
      const {
        allIds,
        types,
        strokeColors,
        fillColors,
        bowings,
        roughnesses,
        strokeWidths,
        strokeLineDashes,
        fillStyles,
        opacities,
        roughElements,
        p1,
        p2,
      } = newCanvasElementState;

      return {
        ...state,
        allIds,
        types,
        strokeColors,
        fillColors,
        bowings,
        roughnesses,
        strokeWidths,
        fillStyles,
        strokeLineDashes,
        opacities,
        roughElements,
        p1,
        p2,
      };
    });

/** Store Hook */
const canvasElementStore = create<CanvasElementStore>()((set) => ({
  ...initialCanvasElementState,
  addCanvasElement: addCanvasElement(set),
  editCanvasElement: editCanvasElement(set),
  setSelectedElement: setSelectedElement(set),
  setCanvasElementState: setCanvasElementState(set),
  undoCanvasElementState: undoCanvasElementState(set),
  redoCanvasElementState: redoCanvasElementState(set),
}));
export const useCanvasElementStore =
  createStoreWithSelectors(canvasElementStore);
