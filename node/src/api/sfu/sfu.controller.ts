import { Request, Response } from 'express';
import { sfuManager } from '../../lib/webrtc/SFUManager';
import { HTTP_STATUS } from '../../constants';

/**
 * REST signalling server for WebRTC Room-based SFU. The REST
 * controller is responsible for handling the SDP Protocol negotation
 * initiation. The ICE Protocol is handled by the Websocket acting as
 * the signalling server.
 * @author Yousef Yassin
 */

/**
 * Add a producer to the SFUManager, handling SDP Protocol negotiation.
 */
export const addProducer = async (req: Request, res: Response) => {
  /**
   * Extract relevant data from the request body.
   * @param sdpRemote String, the remote SDP received from the client.
   * @param roomId String, the ID of the room associated with the operation.
   * @param userId String, the ID of the user associated with the operation.
   */
  const {
    body: { sdp: sdpRemote, roomId, userId },
  } = req;

  // Add a producer to the SFUManager and retrieve the local SDP to send back to the remote client.
  const sdpLocal = await sfuManager.addProducer(userId, roomId, sdpRemote);
  const status = sdpLocal === null ? HTTP_STATUS.ERROR : HTTP_STATUS.SUCCESS;
  const response =
    sdpLocal === null ? { error: 'producer.exists' } : { sdp: sdpLocal };
  res.status(status).json(response);
};

/**
 * Add a consumer to the SFUManager, handling SDP Protocol negotiation.
 */
export const addConsumer = async (req: Request, res: Response) => {
  /**
   * Extract relevant data from the request body.
   * @param sdpRemote String, the remote SDP received from the client.
   * @param roomId String, the ID of the room associated with the operation.
   * @param userId String, the ID of the user associated with the operation.
   */
  const {
    body: { sdp: sdpRemote, roomId, userId },
  } = req;
  // Add a consumer to the SFUManager and retrieve the local SDP to send back to the remote client.
  const sdpLocal = await sfuManager.addConsumer(userId, roomId, sdpRemote);
  const status = sdpLocal === null ? HTTP_STATUS.ERROR : HTTP_STATUS.SUCCESS;
  const response =
    sdpLocal === null ? { error: 'stream.does.not.exists' } : { sdp: sdpLocal };
  res.status(status).json(response);
};

/**
 * Poll the SFUManager to check if the room has an active producer. This is used
 * to determine whether the client should send an offer or answer to the SFUManager to join the room.
 */
export const pollProducer = async (req: Request, res: Response) => {
  const {
    body: { roomId },
  } = req;
  const producerId = sfuManager.producerId(roomId);
  res.status(HTTP_STATUS.SUCCESS).json({ producerId });
};
