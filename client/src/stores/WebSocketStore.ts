import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';
import WebsocketClient from '@/WebsocketClient';
import { getInitials } from '@/lib/misc';

/**
 * Define Global WebSocket states and reducers
 * @author Abdalla Abdelhadi
 */

export const Actions = [
  'addCanvasShape',
  'addCanvasFreehand',
  'editCanvasElement',
  'undoCanvasHistory',
  'redoCanvasHistory',
  'removeCanvasElements',
] as const;
export type ActionsType = typeof Actions;

export interface User {
  username: string;
  email: string;
  initials: string;
  avatar: string;
  outlineColor?: string; // Add an optional 'outlineColor' property
}

/** Definitions */
interface WebSocketState {
  // Reference for sending non-stateful messages (WebRTC signalling)
  socket: WebsocketClient | undefined;
  // The roomID for the websocket to join
  roomID: string | null;
  // The current action
  action: string;
  // Modifed element ID
  actionElementID: string | string[];
  activeTenants: Record<string, User>;
  activeProducerID: string | null;
}

interface WebSocketActions {
  // Reducer to set the roomID
  setRoomID: (roomID: string | null) => void;
  // Set action and elemID
  setWebsocketAction: (elemID: string | string[], action: string) => void;
  // Set the socket reference
  setSocket: (socket: WebsocketClient) => void;
  setTenants: (tenants: Record<string, User>) => void;
  clearTenants: () => void;
  setActiveProducerId: (producerId: string | null) => void;
}

type WebSocketStore = WebSocketActions & WebSocketState;

// Initialize WebSocket State to default state.
export const initialWebSocketState: WebSocketState = {
  socket: undefined,
  roomID: null,
  action: '',
  actionElementID: '',
  activeTenants: {},
  activeProducerID: null,
};

/** Actions / Reducers */
const setSocket =
  (set: SetState<WebSocketStore>) => (socket: WebsocketClient) =>
    set(() => ({ socket }));

const setRoomID = (set: SetState<WebSocketStore>) => (roomID: string | null) =>
  set(() => ({ roomID }));

const setWebsocketAction =
  (set: SetState<WebSocketStore>) =>
  (actionElementID: string | string[], action: string) =>
    set(() => {
      return { actionElementID, action };
    });
const setTenants =
  (set: SetState<WebSocketStore>) => (activeTenants: Record<string, User>) =>
    set(() => ({ activeTenants }));
const clearTenants = (set: SetState<WebSocketStore>) => () =>
  set(() => ({ activeTenants: {} }));
const setActiveProducerId =
  (set: SetState<WebSocketStore>) => (producerId: string | null) =>
    set(() => ({ activeProducerID: producerId }));

/** Store Hook */
const WebSocketStore = create<WebSocketStore>()((set) => ({
  ...initialWebSocketState,
  setSocket: setSocket(set),
  setRoomID: setRoomID(set),
  setWebsocketAction: setWebsocketAction(set),
  setTenants: setTenants(set),
  clearTenants: clearTenants(set),
  setActiveProducerId: setActiveProducerId(set),
}));
export const useWebSocketStore = createStoreWithSelectors(WebSocketStore);

const username = 'Yousef Yassin';
const email = 'yousefyassin@cmail.carleton.ca';
const avatar = 'https://github.com/shadcn.png';
export const users = [
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#0000ff]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#0f0f00]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#ff0000]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#ff0000]',
  },
  {
    username,
    email,
    avatar: '',
    initials: getInitials(username),
    outlineColor: 'border-[#323232]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#243c5a]',
  },
  {
    username,
    email,
    avatar,
    initials: getInitials(username),
    outlineColor: 'border-[#00ff00]',
  },
];
