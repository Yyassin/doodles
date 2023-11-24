const WS_PORT = 3005 as number;
export const WS_URL = `ws://localhost:${WS_PORT}`;
export const HTTP_STATUS = {
  SUCCESS: 200,
  ERROR: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;
export const accessToken = 'accessToken';
export const REST_ROOT = 'http://localhost:3005';
export const REST_URL = { auth: `${REST_ROOT}/auth/token` };
