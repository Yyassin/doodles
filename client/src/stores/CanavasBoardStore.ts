import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Define Global CanvasBoard states and reducers
 * @author Abdalla Abdelhadi, Zakariyya Almalki
 */

export const boards = ['Folder', 'Templates', 'Settings'] as const;
export type BoardsType = (typeof boards)[number];

/** Boards blueprint */
export interface Canvas {
  collaborators: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  title: string;
  tags: string[];
  folder: string;
  shareUrl: string;
  roomID: string;
}

/** Definitions */
interface CanvasBoardState {
  canvases: Canvas[];
  // The current board
  board: BoardsType;
  // The current folder
  folder: string;
  // Currently selected board's metadata
  boardMeta: {
    title: string;
    id: string;
    lastModified: string;
    roomID: string;
    shareUrl: string;
    folder: string;
    tags: string[];
  };
}

interface CanvasBoardActions {
  // Set board and optionally folder
  setBoard: (board: BoardsType, folder: string) => void;
  setCanvases: (canvases: Canvas[]) => void;
  addCanvas: (canvas: Canvas) => void;
  removeCanvas: (id: string) => void;
  updateCanvas: (id: string, meta: string) => void;
  updateCanvasInfo: (
    id: string,
    title: string,
    folder: string,
    tags: string[],
  ) => void;
  setBoardMeta: (meta: Partial<CanvasBoardState['boardMeta']>) => void;
  setTag: (tags: Array<string>) => void;
}

type CanvasBoardStore = CanvasBoardActions & CanvasBoardState;

// Initialize CanvasBoard State to default state.
export const initialCanvasState: CanvasBoardState = {
  canvases: [],
  board: boards[0],
  folder: 'Recent',
  boardMeta: {
    title: '',
    id: '',
    lastModified: '',
    roomID: '',
    shareUrl: '',
    folder: '',
    tags: [],
  },
};

/** Actions / Reducers */
const setBoard =
  (set: SetState<CanvasBoardStore>) =>
  (board: BoardsType, folder = 'Recent') =>
    set(() => ({ board, folder }));

const setCanvases = (set: SetState<CanvasBoardStore>) => (canvases: Canvas[]) =>
  set(() => ({ canvases }));

const addCanvas = (set: SetState<CanvasBoardStore>) => (canvas: Canvas) =>
  set((state) => {
    const canvases = state.canvases;
    canvases.push(canvas);

    return { ...state, canvases };
  });

const removeCanvas = (set: SetState<CanvasBoardStore>) => (id: string) =>
  set((state) => {
    const canvases = state.canvases.filter((canvas) => canvas.id !== id);

    return { ...state, canvases };
  });

const updateCanvas =
  (set: SetState<CanvasBoardStore>) => (id: string, updatedAt: string) =>
    set((state) => {
      const canvases = state.canvases.map((canvas) =>
        canvas.id === id ? { ...canvas, updatedAt } : canvas,
      );

      return { ...state, canvases };
    });

const updateCanvasInfo =
  (set: SetState<CanvasBoardStore>) =>
  (id: string, title: string, folder: string, tags: string[]) =>
    set((state) => {
      const canvases = state.canvases.map((canvas) =>
        canvas.id === id ? { ...canvas, title, folder, tags } : canvas,
      );

      return { ...state, canvases };
    });

const setBoardMeta =
  (set: SetState<CanvasBoardStore>) =>
  (meta: Partial<CanvasBoardState['boardMeta']>) => {
    set((state) => ({ boardMeta: { ...state.boardMeta, ...meta } }));
  };

const setTag = (set: SetState<CanvasBoardStore>) => (tags: Array<string>) =>
  set((state) => ({ boardMeta: { ...state.boardMeta, tags } }));

/** Store Hook */
const CanvasBoardStore = create<CanvasBoardStore>()((set) => ({
  ...initialCanvasState,
  setBoard: setBoard(set),
  setCanvases: setCanvases(set),
  addCanvas: addCanvas(set),
  removeCanvas: removeCanvas(set),
  updateCanvas: updateCanvas(set),
  updateCanvasInfo: updateCanvasInfo(set),
  setBoardMeta: setBoardMeta(set),
  setTag: setTag(set),
}));
export const useCanvasBoardStore = createStoreWithSelectors(CanvasBoardStore);
