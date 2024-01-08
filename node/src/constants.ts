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

export enum WS_TOPICS {
  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  RTC_END_CALL = 'rtc-end-call',
  RTC_NEW_PRODUCER = 'rtc-new-producer',
  RTC_DISCONNECT_PRODUCER = 'rtc-disconnect-producer',
  ICE_CANDIDATE = 'ice-candidate',
}
export const preLeaveRoomTopic = `pre-${WS_TOPICS.LEAVE_ROOM}`;

// STUN server list for ICE candidate gathering.
export const ICE_SERVERS = [
  { urls: 'stun:stun.stunprotocol.org' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
  { urls: 'stun:stun.l.google.com:19302' },
];

// Default logger level.
export const LOG_LEVEL = LogLevel.DEBUG;
