import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Define Global WebSocket states and reducers
 * @author Abdalla Abdelhadi
 */

export const Actions = [
  'addCanvasShape',
  'addCanvasFreehand',
  'editCanvasElement',
] as const;
export type ActionsType = typeof Actions;

/** Definitions */
interface WebSocketState {
  // The roomID for the websocket to join
  roomID: string | null;
  // The current action
  action: string;
  // Modifed element ID
  actionElementID: string;
}

interface WebSocketActions {
  // Reducer to set the roomID
  setRoomID: (roomID: string | null) => void;
  // Set action and elemID
  setWebsocketAction: (elemID: string, action: string) => void;
}

type WebSocketStore = WebSocketActions & WebSocketState;

// Initialize WebSocket State to default state.
export const initialWebSocketState: WebSocketState = {
  roomID: null,
  action: '',
  actionElementID: '',
};

/** Actions / Reducers */
const setRoomID = (set: SetState<WebSocketStore>) => (roomID: string | null) =>
  set(() => ({ roomID }));

const setWebsocketAction =
  (set: SetState<WebSocketStore>) => (actionElementID: string, tool: string) =>
    set(() => {
      return { actionElementID, action: tool };
    });

/** Store Hook */
const WebSocketStore = create<WebSocketStore>()((set) => ({
  ...initialWebSocketState,
  setRoomID: setRoomID(set),
  setWebsocketAction: setWebsocketAction(set),
}));
export const useWebSocketStore = createStoreWithSelectors(WebSocketStore);
