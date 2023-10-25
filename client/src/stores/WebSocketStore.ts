import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Define Global WebSocket states and reducers
 * @author Abdalla Abdelhadi
 */

/** Definitions */
interface WebSocketState {
  // The roomID for the websocket to join
  roomID: string | null;
  // The current action
  counter: number | null;
}

interface WebSocketActions {
  // Reducer to set the roomID
  setRoomID: (roomID: string | null) => void;
  // Reducer to set the action
  setCounter: () => void;
}
type WebSocketStore = WebSocketActions & WebSocketState;

// Initialize WebSocket State to default state.
export const initialWebSocketState: WebSocketState = {
  roomID: null,
  counter: null,
};

/** Actions / Reducers */
const setRoomID = (set: SetState<WebSocketStore>) => (roomID: string | null) =>
  set(() => ({ roomID }));
const setAction = (set: SetState<WebSocketStore>) => () =>
  set((state) => ({
    ...state,
    counter: state.counter ? state.counter + 1 : 1,
  }));

/** Store Hook */
const WebSocketStore = create<WebSocketStore>()((set) => ({
  ...initialWebSocketState,
  setRoomID: setRoomID(set),
  setCounter: setAction(set),
}));
export const useWebSocketStore = createStoreWithSelectors(WebSocketStore);
