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
  fillColor?: string; // Inside fill color, in hex
  bowing: number; // [0, 1], specifies stroke curviness
  roughness: number; // Specified line roughness
  strokeWidth: number; // Stroke width in pixels
  fillStyle: CanvasElementFillStyle; // Pattern for filling the element
  strokeLineDash: number[]; // Array of gap width between strokes (repeats)
  opacity: number; // Element opacity
  roughElement?: Drawable; // The underlying roughjs element, if applicable.
  freehandPoints?: Vector2[]; // Points for curves
  fileId?: string; // For image elements; the id of the image in cache.
  imgDataURL?: string; // For image elements; the dataURL of the image. Used in exports.
  isImagePlaced: boolean; // For image elements; true if the element has been placed, false otherwise.
  text: string; // Container stringW
  fontFamily: string; // Font Family
  fontSize: number; // Font Size
  p1: Vector2; // Top left coordinate, or center for circles
  p2: Vector2; // Bottom right coordinate
  angle: number; // Element orientation, in radians
  id: string; // Element id
  attachedFileUrl?: string; //Attatched file link
  attachedUrl?: string; //Attatche link
}

//Default customizability options
export interface ToolOptions {
  strokeColor: string;
  fillColor: string | undefined;
  fontFamily: string;
  fontSize: number;
  roughness: number;
  strokeWidth: number;
  fillStyle: CanvasElementFillStyle;
  strokeLineDash: number[];
  opacity: number;
  bowing: number;
}

export interface CanvasElementState {
  isSelectionFrameSet: boolean;
  selectionFrame: Pick<CanvasElement, 'p1' | 'p2'> | null;
  selectedElementIds: string[];
  pendingImageElementId: string;
  allIds: string[];
  types: Record<string, CanvasElement['type']>;
  strokeColors: Record<string, CanvasElement['strokeColor']>;
  fillColors: Record<string, CanvasElement['fillColor']>;
  fontFamilies: Record<string, CanvasElement['fontFamily']>;
  fontSizes: Record<string, CanvasElement['fontSize']>;
  bowings: Record<string, CanvasElement['bowing']>;
  roughnesses: Record<string, CanvasElement['roughness']>;
  strokeWidths: Record<string, CanvasElement['strokeWidth']>;
  fillStyles: Record<string, CanvasElement['fillStyle']>;
  strokeLineDashes: Record<string, CanvasElement['strokeLineDash']>;
  opacities: Record<string, CanvasElement['opacity']>;
  roughElements: Record<string, CanvasElement['roughElement']>;
  freehandPoints: Record<string, CanvasElement['freehandPoints']>;
  freehandBounds: Record<string, [Vector2, Vector2]>;
  textStrings: Record<string, CanvasElement['text']>;
  p1: Record<string, CanvasElement['p1']>;
  p2: Record<string, CanvasElement['p2']>;
  fileIds: Record<string, CanvasElement['fileId']>;
  isImagePlaceds: Record<string, CanvasElement['isImagePlaced']>;
  angles: Record<string, CanvasElement['angle']>;
  toolOptions: ToolOptions;
  attachedFileUrls: Record<string, CanvasElement['attachedFileUrl']>;
  attachedUrls: Record<string, CanvasElement['attachedUrl']>;
}

interface CanvasElementActions {
  addCanvasShape: (element: CanvasElement) => void;
  addCanvasFreehand: (element: CanvasElement) => void;
  editCanvasElement: (
    id: string,
    partialElement: Partial<CanvasElement>,
    isLive?: boolean,
  ) => void;
  removeCanvasElements: (ids: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  setPendingImageElement: (id: string) => void;
  undoCanvasHistory: () => void;
  pushCanvasHistory: () => void;
  resetCanvas: () => void;
  updateAttachedFileUrl: (id: string, url: string) => void;
  removeAttachedFileUrl: (ids: string[]) => void;
  updateAttachedUrl: (id: string, url: string) => void;
  removeAttachedUrl: (ids: string[]) => void;
  redoCanvasHistory: () => void;
  setCanvasElementState: (element: CanvasElementState) => void;
  setSelectionFrame: (
    selectionFrame: Partial<Pick<CanvasElement, 'p1' | 'p2'>> | null,
  ) => void;
  setToolOptions: (toolOptions: Partial<ToolOptions>) => void;
}
type CanvasElementStore = CanvasElementState & CanvasElementActions;

// Initialize Canvas Element State to default state
export const initialCanvasElementState: CanvasElementState = {
  isSelectionFrameSet: false,
  selectionFrame: null,
  selectedElementIds: [] as string[],
  pendingImageElementId: '',
  allIds: [],
  types: {},
  strokeColors: {},
  fillColors: {},
  attachedFileUrls: {},
  attachedUrls: {},
  fontFamilies: {},
  fontSizes: {},
  bowings: {},
  roughnesses: {},
  strokeWidths: {},
  fillStyles: {},
  strokeLineDashes: {},
  opacities: {},
  roughElements: {},
  freehandPoints: {},
  freehandBounds: {},
  textStrings: {},
  p1: {},
  p2: {},
  fileIds: {},
  isImagePlaceds: {},
  angles: {},
  toolOptions: {
    fontFamily: 'trebuchet MS',
    fontSize: 24,
    opacity: 1,
    strokeColor: '#000000',
    fillColor: undefined as string | undefined,
    roughness: 0.01,
    strokeWidth: 3,
    fillStyle: 'none' as CanvasElementFillStyle,
    strokeLineDash: [0],
    bowing: 0,
  },
};

// History of prior canvas element stores for undo/redo.
export let history: CanvasElementState[] = [initialCanvasElementState];
// Index pointing to the current canvas element state inside history.
export let historyIndex = 0;

/* Actions */
/**
 * Adds the specified canvas element to state.
 * @param element The element to add.
 * @returns Updated state with the element added.
 */
const addCanvasShape =
  (set: SetState<CanvasElementState>) => (element: CanvasElement) =>
    set((state) => {
      const allIds = [...state.allIds];
      const types = { ...state.types };
      const strokeColors = { ...state.strokeColors };
      const fillColors = { ...state.fillColors };
      const fontFamilies = { ...state.fontFamilies };
      const fontSizes = { ...state.fontSizes };
      const bowings = { ...state.bowings };
      const roughnesses = { ...state.roughnesses };
      const strokeWidths = { ...state.strokeWidths };
      const fillStyles = { ...state.fillStyles };
      const strokeLineDashes = { ...state.strokeLineDashes };
      const opacities = { ...state.opacities };
      const roughElements = { ...state.roughElements };
      const textStrings = { ...state.textStrings };
      const p1s = { ...state.p1 };
      const p2s = { ...state.p2 };
      const fileIds = { ...state.fileIds };
      const isImagePlaceds = { ...state.isImagePlaceds };
      const angles = { ...state.angles };
      const attachedFileUrls = { ...state.attachedFileUrls };
      const attachedUrls = { ...state.attachedUrls };
      const {
        id,
        type,
        strokeColor,
        fillColor,
        attachedFileUrl,
        attachedUrl,
        fontFamily,
        fontSize,
        bowing,
        roughness,
        strokeWidth,
        fillStyle,
        strokeLineDash,
        opacity,
        roughElement,
        text,
        p1,
        p2,
        fileId,
        isImagePlaced,
        angle,
      } = element;
      allIds.push(id);
      types[id] = type;
      strokeColors[id] = strokeColor;
      fillColors[id] = fillColor;
      attachedFileUrls[id] = attachedFileUrl;
      attachedUrls[id] = attachedUrl;
      fontFamilies[id] = fontFamily;
      fontSizes[id] = fontSize;
      bowings[id] = bowing;
      roughnesses[id] = roughness;
      strokeWidths[id] = strokeWidth;
      fillStyles[id] = fillStyle;
      strokeLineDashes[id] = strokeLineDash;
      opacities[id] = opacity;
      roughElements[id] = roughElement;
      textStrings[id] = text;
      p1s[id] = p1;
      p2s[id] = p2;
      fileIds[id] = fileId;
      isImagePlaceds[id] = isImagePlaced;
      angles[id] = angle;
      return {
        ...state,
        allIds,
        types,
        strokeColors,
        fillColors,
        attachedFileUrls,
        attachedUrls,
        fontFamilies,
        fontSizes,
        bowings,
        roughnesses,
        strokeWidths,
        fillStyles,
        strokeLineDashes,
        opacities,
        roughElements,
        textStrings,
        p1: p1s,
        p2: p2s,
        fileIds,
        isImagePlaceds,
        angles,
      };
    });

/**
 * Adds a freehand element to state.
 * @param element The curve to add.
 * @returns Updated state with the element added.
 */
const addCanvasFreehand =
  (set: SetState<CanvasElementState>) => (element: CanvasElement) =>
    set((state) => {
      const allIds = [...state.allIds];
      const types = { ...state.types };
      const strokeColors = { ...state.strokeColors };
      const strokeWidths = { ...state.strokeWidths };
      const opacities = { ...state.opacities };
      const freehandPoints = { ...state.freehandPoints };
      const angles = { ...state.angles };
      const p1 = { ...state.p1 };
      const p2 = { ...state.p2 };

      const {
        id,
        type,
        strokeColor,
        strokeWidth,
        opacity,
        freehandPoints: elemFreehandPoints,
        angle,
      } = element;
      allIds.push(id);
      types[id] = type;
      strokeColors[id] = strokeColor;
      strokeWidths[id] = strokeWidth;
      opacities[id] = opacity;
      freehandPoints[id] = elemFreehandPoints;
      angles[id] = angle;

      const xCoords = elemFreehandPoints?.map(({ x }) => x) ?? [];
      const yCoords = elemFreehandPoints?.map(({ y }) => y) ?? [];
      const [minX, maxX] = [Math.min(...xCoords), Math.max(...xCoords)];
      const [minY, maxY] = [Math.min(...yCoords), Math.max(...yCoords)];

      const freehandBounds = {
        ...state.freehandBounds,
        [id]: [
          { x: minX, y: minY },
          { x: maxX, y: maxY },
        ] as [Vector2, Vector2],
      };

      p1[id] = { x: minX, y: minY };
      p2[id] = { x: maxX, y: maxY };

      return {
        ...state,
        allIds,
        types,
        strokeColors,
        strokeWidths,
        opacities,
        freehandPoints,
        freehandBounds,
        p1,
        p2,
        angles,
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
  (id: string, partialElement: Partial<CanvasElement>, isLive = false) =>
    set((state) => {
      // Edit shouldn't add a new id
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
      const fontFamilies = partialElement.fontFamily
        ? {
            ...state.fontFamilies,
            [id]: partialElement.fontFamily,
          }
        : state.fontFamilies;
      const fontSizes = partialElement.fontSize
        ? {
            ...state.fontSizes,
            [id]: partialElement.fontSize,
          }
        : state.fontSizes;
      const attachedFileUrls = partialElement.attachedFileUrl
        ? {
            ...state.attachedFileUrls,
            [id]: partialElement.attachedFileUrl,
          }
        : state.attachedFileUrls;
      const attachedUrls = partialElement.attachedUrl
        ? {
            ...state.attachedUrls,
            [id]: partialElement.attachedUrl,
          }
        : state.attachedUrls;
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
      let p1s = partialElement.p1
        ? { ...state.p1, [id]: partialElement.p1 }
        : state.p1;
      let p2s = partialElement.p2
        ? { ...state.p2, [id]: partialElement.p2 }
        : state.p2;
      const freehandPoints = partialElement.freehandPoints
        ? { ...state.freehandPoints, [id]: partialElement.freehandPoints }
        : state.freehandPoints;
      const textStrings = partialElement.text
        ? { ...state.textStrings, [id]: partialElement.text }
        : state.textStrings;
      const fileIds = partialElement.fileId
        ? { ...state.fileIds, [id]: partialElement.fileId }
        : state.fileIds;
      const isImagePlaceds = partialElement.isImagePlaced
        ? { ...state.isImagePlaceds, [id]: partialElement.isImagePlaced }
        : state.isImagePlaceds;
      const angles = partialElement.angle
        ? { ...state.angles, [id]: partialElement.angle }
        : state.angles;

      let freehandBounds = state.freehandBounds;
      if (partialElement.freehandPoints !== undefined) {
        const xCoords = partialElement.freehandPoints?.map(({ x }) => x) ?? [];
        const yCoords = partialElement.freehandPoints?.map(({ y }) => y) ?? [];
        const [minX, maxX] = [Math.min(...xCoords), Math.max(...xCoords)];
        const [minY, maxY] = [Math.min(...yCoords), Math.max(...yCoords)];

        freehandBounds = {
          ...state.freehandBounds,
          [id]: [
            { x: minX, y: minY },
            { x: maxX, y: maxY },
          ],
        };

        if (!isLive) {
          p1s = { ...state.p1, [id]: { x: minX, y: minY } };
          p2s = { ...state.p2, [id]: { x: maxX, y: maxY } };
        }
      }

      return {
        ...state,
        // allIds,
        types,
        strokeColors,
        fillColors,
        attachedFileUrls,
        attachedUrls,
        fontFamilies,
        fontSizes,
        bowings,
        roughnesses,
        strokeWidths,
        fillStyles,
        strokeLineDashes,
        opacities,
        roughElements,
        p1: p1s,
        p2: p2s,
        freehandPoints,
        freehandBounds,
        textStrings,
        fileIds,
        isImagePlaceds,
        angles,
      };
    });

const setToolOptions =
  (set: SetState<CanvasElementState>) => (toolOptions: Partial<ToolOptions>) =>
    set((state) => ({
      toolOptions: { ...state.toolOptions, ...toolOptions },
    }));

//Uploads file to firebase and attatches link to canvas element
const updateAttachedFileUrl =
  (set: SetState<CanvasElementState>) => (id: string, url: string) =>
    set((state) => {
      const updatedAttachedFileUrls = { ...state.attachedFileUrls, [id]: url };
      return { ...state, attachedFileUrls: updatedAttachedFileUrls };
    });

//Deletes attatched link (file) from canvas element
const removeAttachedFileUrl =
  (set: SetState<CanvasElementState>) => (ids: string[]) =>
    set((state) => {
      const attachedFileUrls = { ...state.attachedFileUrls };
      ids.forEach((id) => {
        delete attachedFileUrls[id];
      });

      return {
        ...state,
        attachedFileUrls,
      };
    });

///Attatches link to canvas element
const updateAttachedUrl =
  (set: SetState<CanvasElementState>) => (id: string, url: string) =>
    set((state) => {
      const updatedAttachedUrls = { ...state.attachedUrls, [id]: url };
      return { ...state, attachedUrls: updatedAttachedUrls };
    });

//Deletes attatched link from canvas element
const removeAttachedUrl =
  (set: SetState<CanvasElementState>) => (ids: string[]) =>
    set((state) => {
      const attachedUrls = { ...state.attachedUrls };
      ids.forEach((id) => {
        delete attachedUrls[id];
      });

      return {
        ...state,
        attachedUrls,
      };
    });

/**
 * Removes the canvas element with the specfied state
 * from the store.
 * @param id The element to remove.
 * @returns Updated state with the element removed.
 */
const removeCanvasElements =
  (set: SetState<CanvasElementState>) => (ids: string[]) =>
    set((state) => {
      const allIds = [...state.allIds];
      const types = { ...state.types };
      const strokeColors = { ...state.strokeColors };
      const fillColors = { ...state.fillColors };
      const fileIds = { ...state.fileIds };
      const isImagePlaceds = { ...state.isImagePlaceds };
      const attachedFileUrls = { ...state.attachedFileUrls };
      const attachedUrls = { ...state.attachedUrls };
      const fontFamilies = { ...state.fontFamilies };
      const fontSizes = { ...state.fontSizes };
      const bowings = { ...state.bowings };
      const roughnesses = { ...state.roughnesses };
      const strokeWidths = { ...state.strokeWidths };
      const fillStyles = { ...state.fillStyles };
      const strokeLineDashes = { ...state.strokeLineDashes };
      const opacities = { ...state.opacities };
      const roughElements = { ...state.roughElements };
      const p1s = { ...state.p1 };
      const p2s = { ...state.p2 };
      const angles = { ...state.angles };
      const textStrings = { ...state.textStrings };

      ids.forEach((id) => {
        // Delete images from storage, if applicable
        // const fileId = fileIds[id];
        // if (fileId !== undefined) {
        //   const storage = getStorage(firebaseApp);
        //   const storageRef = ref(storage, `boardImages/${fileId}.jpg`);
        //   deleteObject(storageRef)
        //     .then(() => console.log('Deleted image', fileId))
        //     .catch((error) => console.error('Error deleting image', error));
        // }

        allIds.splice(allIds.indexOf(id), 1);
        delete types[id];
        delete strokeColors[id];
        delete fillColors[id];
        delete attachedFileUrls[id];
        delete attachedUrls[id];
        delete fontFamilies[id];
        delete fontSizes[id];
        delete bowings[id];
        delete roughnesses[id];
        delete strokeWidths[id];
        delete fillStyles[id];
        delete strokeLineDashes[id];
        delete opacities[id];
        delete roughElements[id];
        delete p1s[id];
        delete p2s[id];
        delete angles[id];
        delete textStrings[id];
        delete fileIds[id];
        delete isImagePlaceds[id];
      });

      return {
        ...state,
        allIds,
        types,
        strokeColors,
        fillColors,
        attachedFileUrls,
        attachedUrls,
        fontFamilies,
        fontSizes,
        bowings,
        roughnesses,
        strokeWidths,
        fillStyles,
        strokeLineDashes,
        opacities,
        roughElements,
        p1: p1s,
        p2: p2s,
        textStrings,
        angles,
        fileIds,
        isImagePlaceds,
      };
    });

/**
 * Pushes the current store to the history array for undo/redo support.
 */
const pushCanvasHistory = (set: SetState<CanvasElementState>) => () => {
  set((state) => {
    historyIndex++;
    history = history.slice(0, historyIndex);
    history.push({ ...state });
    return state;
  });
};
/**
 * Sets the canvas state to how it was before last element added
 * @returns Updated state without the undoed element.
 */
const undoCanvasHistory = (set: SetState<CanvasElementState>) => () => {
  if (historyIndex > 0) {
    historyIndex--;
    const prevState = history[historyIndex];
    set(prevState);
  }
};
/**
 * Sets the canvas state to how it was before undo.
 * @returns Updated state without the undo.
 */
const redoCanvasHistory = (set: SetState<CanvasElementState>) => () => {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    const prevState = history[historyIndex];
    set(prevState);
  }
};

/**
 * Sets the canvas state to inital state
 * Erases history
 * @returns reset state
 */
const resetCanvas = (set: SetState<CanvasElementState>) => () => {
  historyIndex = 0;
  history = [initialCanvasElementState];
  const state = initialCanvasElementState;
  set(state);
};

/**
 * Sets the currently selected element id.
 * @param selectedElementId The id to set as selected.
 * @returns Updated state with the selected element id.
 */
const setSelectedElements =
  (set: SetState<CanvasElementState>) => (selectedElementIds: string[]) =>
    set(() => ({ selectedElementIds }));

/**
 * Sets the current selection frame state.
 * @param selectionFrame The selection frame state, as
 * bounding coordinates, or null if there is no frame.
 * @returns Updated state with the new frame state.
 */
const defaultSelectionFrame = { p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 } };
const setSelectionFrame =
  (set: SetState<CanvasElementState>) =>
  (selectionFrame: Partial<Pick<CanvasElement, 'p1' | 'p2'>> | null) =>
    set((state) => ({
      ...state,
      isSelectionFrameSet: selectionFrame !== null,
      selectionFrame: selectionFrame && {
        ...(state.selectionFrame ?? defaultSelectionFrame),
        ...selectionFrame,
      },
    }));

/**
 * Sets the currently pending image element id.
 * @param selectedElementId The id to set as selected.
 * @returns Updated state with the selected element id.
 */
const setPendingImageElement =
  (set: SetState<CanvasElementState>) => (pendingImageElementId: string) =>
    set(() => ({ pendingImageElementId }));

/**
 * Set the Canvas state to the paramter passed
 * @param newCanvasElementState The new Canvas state.
 * @returns New Canvas state
 */
const setCanvasElementState =
  (set: SetState<CanvasElementState>) =>
  (newCanvasElementState: CanvasElementState) =>
    set((state) => ({ ...state, ...newCanvasElementState }));

/** Store Hook */
const canvasElementStore = create<CanvasElementStore>()((set) => ({
  ...initialCanvasElementState,
  addCanvasShape: addCanvasShape(set),
  addCanvasFreehand: addCanvasFreehand(set),
  editCanvasElement: editCanvasElement(set),
  removeCanvasElements: removeCanvasElements(set),
  setSelectedElements: setSelectedElements(set),
  setSelectionFrame: setSelectionFrame(set),
  setPendingImageElement: setPendingImageElement(set),
  setCanvasElementState: setCanvasElementState(set),
  undoCanvasHistory: undoCanvasHistory(set),
  pushCanvasHistory: pushCanvasHistory(set),
  redoCanvasHistory: redoCanvasHistory(set),
  resetCanvas: resetCanvas(set),
  setToolOptions: setToolOptions(set),
  updateAttachedFileUrl: updateAttachedFileUrl(set),
  removeAttachedFileUrl: removeAttachedFileUrl(set),
  updateAttachedUrl: updateAttachedUrl(set),
  removeAttachedUrl: removeAttachedUrl(set),
}));
export const useCanvasElementStore =
  createStoreWithSelectors(canvasElementStore);
