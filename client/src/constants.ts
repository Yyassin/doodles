/**
 * Various constants used throughout the application.
 */

import { ipcAPI } from './data/ipc/ipcMessages';

/**
 * REST & Websockets
 */
// Websockets
const WS_PORT = 3005 as number;
const REST_PORT = 3005 as number;
export const WS_URL = `ws://localhost:${WS_PORT}`;
export const ACCESS_TOKEN_TAG = 'accessToken';
export const REST_ROOT = `http://localhost:${REST_PORT}`;
export const REST = {
  user: {
    get: `${REST_ROOT}/user/getUser`,
    create: `${REST_ROOT}/user/createUser`,
  },
  sfu: {
    poll: `${REST_ROOT}/sfu/poll`,
  },
  auth: {
    token: `${REST_ROOT}/auth/token`,
  },
  tenants: {
    get: `${REST_ROOT}/tenancy/room`,
  },
  board: {
    create: `${REST_ROOT}/board/createBoard`,
    getBoards: `${REST_ROOT}/board/getCollaboratorsBoard`,
    getBoard: `${REST_ROOT}/board/getBoard`,
    deleteBoard: `${REST_ROOT}/board/deleteBoard`,
    updateBoard: `${REST_ROOT}/board/updateBoard`,
  },
  comment: {
    getComments: `${REST_ROOT}/comment/getComments`,
    create: `${REST_ROOT}/comment/createComment`,
    update: `${REST_ROOT}/comment/handleLike`,
    delete: `${REST_ROOT}/comment/deleteComment`,
  },
};
export const HTTP_STATUS = {
  SUCCESS: 200,
  ERROR: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;
export const SECONDS_TO_MS = 1e3;
export const WS_RECONNECT_INTERVAL = (1 * SECONDS_TO_MS) as number;
export enum WS_TOPICS {
  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  NOTIFY_JOIN_ROOM = 'notify-join-room',
  NOTIFY_LEAVE_ROOM = 'notify-leave-room',
  RTC_END_CALL = 'rtc-end-call',
  RTC_NEW_PRODUCER = 'rtc-new-producer',
  RTC_DISCONNECT_PRODUCER = 'rtc-disconnect-producer',
  ICE_CANDIDATE = 'ice-candidate',
}

// Zoom Constraints
export const ZOOM = {
  INC: 0.01,
  MIN: 0.1, // 10%
  MAX: 20, // 2000%
} as const;

/**
 * Image
 */
// Maximum image dims in pixels
export const DEFAULT_MAX_IMAGE_WIDTH_OR_HEIGHT = 1440;
// Maximum single file size in cache
export const KB = 1024;
export const MB = KB * KB;
export const MAX_ALLOWED_FILE_BYTES = 2 * MB * MB;
export const DRAGGING_THRESHOLD = 10;

/**
 * Peripherals
 */
export const PERIPHERAL_CODES = {
  RIGHT_MOUSE: 2,
};

/**
 * Misc
 */
export const EPSILON = 1e-8;
// True if running in electron, false otherwise (ipcAPI is injected by
// electron's main process).
export const IS_ELECTRON_INSTANCE = ipcAPI !== undefined;
