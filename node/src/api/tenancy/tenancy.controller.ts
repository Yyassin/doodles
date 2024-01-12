import { Request, Response } from 'express';
import { websocketManager } from '../../lib/websocket/WebSocketManager';
import { HTTP_STATUS } from '../../constants';
import { sfuManager } from '../../lib/webrtc/SFUManager';

/**
 * Defines the REST controller for the tenancy API.
 * @author Yousef Yassin
 */

/**
 * Retrieves the usernames of the tenants in the specified room,
 * or empty array if the room does not exist.
 */
export const roomTenancy = async (req: Request, res: Response) => {
  const {
    body: { roomId },
  } = req;
  const tenants = websocketManager.sockets[roomId];
  const tenantIds = tenants ? Object.keys(tenants) : [];

  res.status(HTTP_STATUS.SUCCESS).json({
    tenantIds,
  });
};
