/**
 * Various constants used throughout the application.
 */

// Websockets
const WS_PORT = 3005 as number;
export const WS_URL = `ws://localhost:${WS_PORT}`;

// Zoom Constraints
export const ZOOM = {
  INC: 0.01,
  MIN: 0.1, // 10%
  MAX: 20, // 2000%
} as const;
