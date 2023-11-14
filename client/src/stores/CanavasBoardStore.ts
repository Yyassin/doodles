import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Define Global CanvasBoard states and reducers
 * @author Abdalla Abdelhadi
 */

export const boards = ['Folder', 'Templates', 'Settings'] as const;
export type BoardsType = (typeof boards)[number];

/** Definitions */
interface CanvasBoardState {
  // The current board
  board: BoardsType;
  // The current folder
  folder: string;
}

interface CanvasBoardActions {
  // Set board and optionally folder
  setBoard: (board: BoardsType, folder: string) => void;
}

type CanvasBoardStore = CanvasBoardActions & CanvasBoardState;

// Initialize CanvasBoard State to default state.
export const initialCanvasState: CanvasBoardState = {
  board: boards[0],
  folder: 'Recent',
};

/** Actions / Reducers */
const setBoard =
  (set: SetState<CanvasBoardStore>) =>
  (board: BoardsType, folder = 'Recent') =>
    set(() => ({ board, folder }));

/** Store Hook */
const CanvasBoardStore = create<CanvasBoardStore>()((set) => ({
  ...initialCanvasState,
  setBoard: setBoard(set),
}));
export const useCanvasBoardStore = createStoreWithSelectors(CanvasBoardStore);
