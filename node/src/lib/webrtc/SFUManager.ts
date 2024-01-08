import { LOG_LEVEL, WS_TOPICS, preLeaveRoomTopic } from '../../constants';
import { Logger } from '../../utils/Logger';
import { Singleton } from '../../utils/Singleton';
import { WSCallback, websocketManager } from '../websocket/WebSocketManager';
import { RoomSFU } from './RoomSFU';
import helpers from '../websocket/websocketHelpers';

const { sendErrorResponse, sendSuccessResponse } = helpers;

/**
 * Manages the WebRTC SFUs (Selective Forwarding Units) for handling room-based
 * communication with producers and consumers.
 * @author Yousef Yassin
 */

/**
 * SFUManager Singleton Class
 * Manages instances of RoomSFU for each room to coordinate producers and consumers.
 */
export class SFUManager extends Singleton<SFUManager>() {
  #SFUs = {} as Record<string, RoomSFU>;
  #logger = new Logger(SFUManager.name, LOG_LEVEL);

  /**
   * Creates a new SFUManager instance.
   */
  constructor() {
    super();
    this.#logger.debug('Instantiated.');
  }

  /**
   * Initializes the SFUManager by setting up WebSocket event listeners.
   */
  init() {
    // Callback for terminating a connection
    const terminateConnection: WSCallback = ({ socket, room, id }) => {
      const success = sfuManager.remove(id, room);
      const response = success ? sendSuccessResponse : sendErrorResponse;
      response(socket, 'Stream Ended!');
    };
    websocketManager.on(WS_TOPICS.RTC_END_CALL, terminateConnection);
    websocketManager.on(preLeaveRoomTopic, terminateConnection);

    // Callback for handling incoming ICE candidates to be added.
    websocketManager.on(
      WS_TOPICS.ICE_CANDIDATE,
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

  /**
   * Checks if a room has a producer.
   * @param roomId The ID of the room.
   * @returns True if the room has a producer, false otherwise.
   */
  roomHasProducer(roomId: string) {
    return this.#SFUs[roomId] !== undefined;
  }

  /**
   * Adds an ICE candidate to the specified consumer in the given room.
   * @param id The ID of the consumer.
   * @param roomId The ID of the room.
   * @param candidate The ICE candidate to be added.
   * @returns A promise indicating success or null if the room doesn't exist.
   */
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

  /**
   * Removes a producer or consumer from the specified room.
   * @param id The ID of the producer or consumer to be removed.
   * @param roomId The ID of the room.
   * @returns True if the removal is successful, false otherwise.
   */
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

  /**
   * Adds a producer to the specified room with the given SDP.
   * @param id The ID of the producer.
   * @param roomId The ID of the room.
   * @param sdp The SDP for the producer.
   * @returns A promise with the local description or null if the room already exists.
   */
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

    const roomSFU = new RoomSFU(roomId, this.#logger, (id) =>
      this.remove(id, roomId),
    );
    const localDescription = await roomSFU.addProducer(id, sdp);
    this.#logger.info(
      `Added producer [${id}] to room [${roomId}]: ${
        localDescription !== null
      }.`,
    );
    this.#SFUs[roomId] = roomSFU;
    return localDescription;
  }

  /**
   * Adds a consumer to the specified room with the given SDP.
   * @param id The ID of the consumer.
   * @param roomId The ID of the room.
   * @param sdp The SDP for the consumer.
   * @returns The local description or null if the room doesn't exist.
   */
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
    this.#logger.info(
      `Added consumer [${id}] to room [${roomId}]: ${
        localDescription !== null
      }.`,
    );
    return localDescription;
  }

  /**
   * Removes a producer from the specified room.
   * @param id The ID of the producer.
   * @param roomId The ID of the room.
   * @returns True if the removal is successful, false otherwise.
   */
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
    this.#logger.info(
      `Removed producer [${id}] from room [${roomId}]: ${success}`,
    );
    return success;
  }

  /**
   * Removes a consumer from the specified room.
   * @param id The ID of the consumer.
   * @param roomId The ID of the room.
   * @returns True if the removal is successful, false otherwise.
   */
  removeConsumer(id: string, roomId: string) {
    const roomSFU = this.#SFUs[roomId];
    if (roomSFU === undefined) {
      this.#logger.error(
        `Failed to remove consumer [${id}] from room [${roomId}] because it doesn't exist.`,
      );
      return false;
    }
    const success = roomSFU.removeConsumer(id);
    this.#logger.info(
      `Removed consumer [${id}] from room [${roomId}]: ${success}`,
    );
    return success;
  }
}

// Create a singleton instance of SFUManager
export const sfuManager = SFUManager.Instance;
