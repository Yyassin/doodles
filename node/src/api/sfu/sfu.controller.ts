import { Request, Response } from 'express';
import { sfuManager } from '../../lib/webrtc/SFUManager';
import { HTTP_STATUS } from '../../constants';

export const addProducer = async (req: Request, res: Response) => {
  const {
    body: { sdp: sdpRemote, roomId, userId },
  } = req;
  const sdpLocal = await sfuManager.addProducer(userId, roomId, sdpRemote);
  const status = sdpLocal === null ? HTTP_STATUS.ERROR : HTTP_STATUS.SUCCESS;
  const response =
    sdpLocal === null ? { error: 'producer.exists' } : { sdp: sdpLocal };
  res.status(status).json(response);
};

export const addConsumer = async (req: Request, res: Response) => {
  const {
    body: { sdp: sdpRemote, roomId, userId },
  } = req;
  const sdpLocal = await sfuManager.addConsumer(userId, roomId, sdpRemote);
  const status = sdpLocal === null ? HTTP_STATUS.ERROR : HTTP_STATUS.SUCCESS;
  const response =
    sdpLocal === null ? { error: 'stream.does.not.exists' } : { sdp: sdpLocal };
  res.status(status).json(response);
};

export const pollProducer = async (req: Request, res: Response) => {
  const {
    body: { roomId },
  } = req;
  const roomHasProducer = sfuManager.roomHasProducer(roomId);
  res.status(HTTP_STATUS.SUCCESS).json({ roomHasProducer });
};
