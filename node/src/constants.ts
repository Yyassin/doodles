/**
 * Defines common constants used
 * across the application
 */

import { LogLevel } from './utils/Logger';

/* REST */
// Standard HTTP Protocol Status Codes
export const HTTP_STATUS = {
  SUCCESS: 200,
  ERROR: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ICE_SERVERS = [
  { urls: 'stun:stun.stunprotocol.org' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
  { urls: 'stun:stun.l.google.com:19302' },
];

export const LOG_LEVEL = LogLevel.DEBUG;
