import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';
// import { User } from 'firebase/auth';

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

export interface SharedUser {
  email: string;
  avatar: string;
  initials: string;
  username: string;
  permission: string;
  collabID: string;
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
    collabID: string;
    collaboratorAvatars: Record<string, string>;
    users: SharedUser[];
    permission: string;
  };
}

interface CanvasBoardActions {
  // Set board and optionally folder
  setBoard: (board: BoardsType, folder: string) => void;
  setCanvases: (canvases: Canvas[]) => void;
  addCanvas: (canvas: Canvas) => void;
  removeCanvas: (id: string) => void;
  updateCanvas: (id: string, meta: Partial<Canvas>) => void;
  updateCanvasInfo: (
    id: string,
    title: string,
    folder: string,
    tags: string[],
  ) => void;
  updatePermission: (
    collabID: string,
    permission: string,
    isOwnPerm: boolean,
  ) => void;
  updateAvatars: (collabID: string, avatar: string) => void;
  addUser: (user: SharedUser) => void;
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
    collabID: '',
    collaboratorAvatars: {},
    users: [],
    permission: '',
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
    const canvases = [...state.canvases, canvas];

    return { ...state, canvases };
  });

const removeCanvas = (set: SetState<CanvasBoardStore>) => (id: string) =>
  set((state) => {
    const canvases = state.canvases.filter((canvas) => canvas.id !== id);

    return { ...state, canvases };
  });

const updateCanvas =
  (set: SetState<CanvasBoardStore>) => (id: string, meta: Partial<Canvas>) =>
    set((state) => {
      const canvases = state.canvases.map((canvas) =>
        canvas.id === id ? { ...canvas, ...meta } : canvas,
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

const updateAvatars =
  (set: SetState<CanvasBoardStore>) => (collabID: string, avatar: string) =>
    set((state) => {
      const avatars = {
        ...state.boardMeta.collaboratorAvatars,
        [collabID]: avatar,
      };

      return {
        ...state,
        boardMeta: { ...state.boardMeta, collaboratorAvatars: avatars },
      };
    });

const updatePermission =
  (set: SetState<CanvasBoardStore>) =>
  (collabID: string, permission: string, isOwnPerm: boolean) =>
    set((state) => {
      const users = state.boardMeta.users.map((user) =>
        user.collabID === collabID ? { ...user, permission } : user,
      );

      if (isOwnPerm)
        return { boardMeta: { ...state.boardMeta, users, permission } };
      return { boardMeta: { ...state.boardMeta, users } };
    });

const addUser = (set: SetState<CanvasBoardStore>) => (user: SharedUser) =>
  set((state) => {
    const users = [...state.boardMeta.users, user];

    return { boardMeta: { ...state.boardMeta, users } };
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
  updatePermission: updatePermission(set),
  addUser: addUser(set),
  setBoardMeta: setBoardMeta(set),
  setTag: setTag(set),
  updateAvatars: updateAvatars(set),
}));
export const useCanvasBoardStore = createStoreWithSelectors(CanvasBoardStore);
