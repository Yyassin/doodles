import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';
import WebsocketClient from '@/WebsocketClient';
import { generateRandId } from '@/lib/bytes';

/**
 * Define Global WebSocket states and reducers
 * @author Abdalla Abdelhadi
 */

export const Actions = ['addCanvasShape', 'addCanvasFreehand'] as const;
export type ActionsType = typeof Actions;

/** Definitions */
interface WebSocketState {
  // Reference for sending non-stateful messages (WebRTC signalling)
  socket: WebsocketClient | undefined;
  // The roomID for the websocket to join
  roomID: string | null;
  // The current action
  action: string;
  // Modifed element ID
  actionElementID: string;
  // Temporary, move to authStore
  userId: string;
}

interface WebSocketActions {
  // Reducer to set the roomID
  setRoomID: (roomID: string | null) => void;
  // Set action and elemID
  setWebsocketAction: (elemID: string, action: string) => void;
  // Set the socket reference
  setSocket: (socket: WebsocketClient) => void;
}

type WebSocketStore = WebSocketActions & WebSocketState;

// Initialize WebSocket State to default state.
export const initialWebSocketState: WebSocketState = {
  socket: undefined,
  roomID: null,
  action: '',
  actionElementID: '',
  userId: generateRandId(),
};

/** Actions / Reducers */
const setSocket =
  (set: SetState<WebSocketStore>) => (socket: WebsocketClient) =>
    set(() => ({ socket }));

const setRoomID = (set: SetState<WebSocketStore>) => (roomID: string | null) =>
  set(() => ({ roomID }));

const setWebsocketAction =
  (set: SetState<WebSocketStore>) => (actionElementID: string, tool: string) =>
    set(() => {
      const action =
        tool === 'freehand' ? 'addCanvasFreehand' : 'addCanvasShape';
      return { actionElementID, action };
    });

/** Store Hook */
const WebSocketStore = create<WebSocketStore>()((set) => ({
  ...initialWebSocketState,
  setSocket: setSocket(set),
  setRoomID: setRoomID(set),
  setWebsocketAction: setWebsocketAction(set),
}));
export const useWebSocketStore = createStoreWithSelectors(WebSocketStore);
