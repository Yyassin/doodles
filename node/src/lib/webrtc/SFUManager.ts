import { LOG_LEVEL } from '../../constants';
import { Logger } from '../../utils/Logger';
import { Singleton } from '../../utils/Singleton';
import { WSCallback, websocketManager } from '../websocket/WebSocketManager';
import { RoomSFU } from './RoomSFU';
import helpers from '../websocket/websocketHelpers';

const { sendErrorResponse, sendSuccessResponse } = helpers;

export class SFUManager extends Singleton<SFUManager>() {
  #SFUs = {} as Record<string, RoomSFU>;
  #logger = new Logger(SFUManager.name, LOG_LEVEL);

  constructor() {
    super();
    this.#logger.debug('Instantiated.');
  }

  init() {
    const terminateConnection: WSCallback = ({ socket, room, id }) => {
      const success = sfuManager.remove(id, room);
      const response = success ? sendSuccessResponse : sendErrorResponse;
      response(socket, 'Stream Ended!');
    };
    websocketManager.on('rtc-end', terminateConnection);
    websocketManager.on('preLeaveRoom', terminateConnection);

    websocketManager.on(
      'ice-candidate',
      async ({ socket, room, id, payload }) => {
        const { candidate } = payload as unknown as {
          candidate: RTCIceCandidate;
        };
        const success = await sfuManager.addIceCandidate(id, room, candidate);
        const response = success ? sendSuccessResponse : sendErrorResponse;
        response(socket, 'Received Ice Candidate');
      },
    );
  }

  roomHasProducer(roomId: string) {
    return this.#SFUs[roomId] !== undefined;
  }

  async addIceCandidate(
    id: string,
    roomId: string,
    candidate: RTCIceCandidate,
  ) {
    const roomSFU = this.#SFUs[roomId];
    if (roomSFU === undefined) {
      this.#logger.error(
        `Failed to remove peer [${id}] from room [${roomId}] since the room doesn't exist.`,
      );
      return null;
    }
    return roomSFU.addIceCandidate(id, candidate);
  }

  remove(id: string, roomId: string) {
    const roomSFU = this.#SFUs[roomId];
    if (roomSFU === undefined) {
      this.#logger.error(
        `Failed to remove peer [${id}] from room [${roomId}] since the room doesn't exist.`,
      );
      return false;
    }
    if (roomSFU.producerId === id) {
      return this.removeProducer(id, roomId);
    } else {
      return this.removeConsumer(id, roomId);
    }
  }

  async addProducer(
    id: string,
    roomId: string,
    sdp: RTCSessionDescriptionInit,
  ) {
    if (this.#SFUs[roomId] !== undefined) {
      this.#logger.error(
        `Failed to add producer [${id}] to room [${roomId}] since the room already exists with producer [${
          this.#SFUs[roomId].producerId
        }].`,
      );
      return null;
    }

    const roomSFU = new RoomSFU(roomId, this.#logger);
    const localDescription = await roomSFU.addProducer(id, sdp);
    this.#logger.debug(
      `Added producer [${id}] to room [${roomId}]: ${
        localDescription !== null
      }.`,
    );
    this.#SFUs[roomId] = roomSFU;
    return localDescription;
  }

  async addConsumer(
    id: string,
    roomId: string,
    sdp: RTCSessionDescriptionInit,
  ) {
    const roomSFU = this.#SFUs[roomId];
    if (roomSFU === undefined) {
      this.#logger.error(
        `Failed to add consumer [${id}] to room [${roomId}] because it doesn't exist.`,
      );
      return null;
    }
    const localDescription = roomSFU.addConsumer(id, sdp);
    this.#logger.debug(
      `Added consumer [${id}] to room [${roomId}]: ${
        localDescription !== null
      }.`,
    );
    return localDescription;
  }

  removeProducer(id: string, roomId: string) {
    const roomSFU = this.#SFUs[roomId];
    if (roomSFU === undefined) {
      this.#logger.error(
        `Failed to remove streamer [${id}] from room [${roomId}] because it doesn't exist.`,
      );
      return false;
    }
    const success = roomSFU.removeProducer();
    delete this.#SFUs[roomId];
    this.#logger.debug(`Removed producer [${id}] from room [${roomId}]`);
    return success;
  }

  removeConsumer(id: string, roomId: string) {
    const roomSFU = this.#SFUs[roomId];
    if (roomSFU === undefined) {
      this.#logger.error(
        `Failed to remove consumer [${id}] from room [${roomId}] because it doesn't exist.`,
      );
      return false;
    }
    return roomSFU.removeConsumer(id);
  }
}

export const sfuManager = SFUManager.Instance;
