/**
 * Various constants used throughout the application.
 */

/**
 * REST & Websockets
 */
// Websockets
const WS_PORT = 3005 as number;
export const WS_URL = `ws://localhost:${WS_PORT}`;
export const ACCESS_TOKEN_TAG = 'accessToken';
export const REST_ROOT = 'http://localhost:3005';
export const REST_URL = { auth: `${REST_ROOT}/auth/token` };
export const GET_USER_URL = {
  getUser: `${REST_ROOT}/user/getUser`,
  createUser: `${REST_ROOT}/user/createUser`,
};
export const HTTP_STATUS = {
  SUCCESS: 200,
  ERROR: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;

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
export const MAX_ALLOWED_FILE_BYTES = 2 * 1024 * 1024;
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
