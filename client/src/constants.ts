/**
 * Various constants used throughout the application.
 */

// Websockets
const WS_PORT = 3005 as number;
export const WS_URL = `ws://localhost:${WS_PORT}`;
export const HTTP_STATUS = {
  SUCCESS: 200,
  ERROR: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;
export const ACCESS_TOKEN_TAG = 'accessToken';
export const REST_ROOT = 'http://localhost:3005';
export const REST_URL = { auth: `${REST_ROOT}/auth/token` };

// Zoom Constraints
export const ZOOM = {
  INC: 0.01,
  MIN: 0.1, // 10%
  MAX: 20, // 2000%
} as const;
