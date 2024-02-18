import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Define Global CanvasBoard states and reducers
 * @author Abdalla Abdelhadi
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
    lastModified: string;
    roomID: string;
  };
}

interface CanvasBoardActions {
  // Set board and optionally folder
  setBoard: (board: BoardsType, folder: string) => void;
  setCanvases: (canvases: Canvas[]) => void;
  addCanvas: (canvas: Canvas) => void;
  setBoardMeta: (meta: Partial<CanvasBoardState['boardMeta']>) => void;
}

type CanvasBoardStore = CanvasBoardActions & CanvasBoardState;

// Initialize CanvasBoard State to default state.
export const initialCanvasState: CanvasBoardState = {
  canvases: [],
  board: boards[0],
  folder: 'Recent',
  boardMeta: {
    title: '',
    lastModified: '',
    roomID: '',
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

const setBoardMeta =
  (set: SetState<CanvasBoardStore>) =>
  (meta: Partial<CanvasBoardState['boardMeta']>) => {
    set((state) => ({ boardMeta: { ...state.boardMeta, ...meta } }));
  };

/** Store Hook */
const CanvasBoardStore = create<CanvasBoardStore>()((set) => ({
  ...initialCanvasState,
  setBoard: setBoard(set),
  setCanvases: setCanvases(set),
  addCanvas: addCanvas(set),
  setBoardMeta: setBoardMeta(set),
}));
export const useCanvasBoardStore = createStoreWithSelectors(CanvasBoardStore);
