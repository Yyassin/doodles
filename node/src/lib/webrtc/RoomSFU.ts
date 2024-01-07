import { WS_TOPICS } from '../../constants';
import { ConsumerPeer, StreamerPeer } from '../../types';
import { Logger } from '../../utils/Logger';
import { truncateString } from '../../utils/misc';
import { websocketManager } from '../websocket/WebSocketManager';
import { createPeer, hookSignals } from './wrtcHelpers';

/**
 * Implementation of the RoomSFU class, which manages the WebRTC communication
 * between a streamer and consumers in a room. It facilitates the addition and removal of producers and consumers,
 * handling the negotiation of SDPs, ICE candidates, and managing the underlying WebRTC connections.
 * @author Yousef Yassin
 */

/**
 * Class representing a RoomSFU (Selective Forwarding Unit) for WebRTC communication.
 * We focus on a single streamer and multiple consumers.
 */
export class RoomSFU {
  #producer: StreamerPeer | null;
  #consumers: Record<string, ConsumerPeer>;
  #roomId: string;
  #logger: Logger;
  #onCleanup: (id: string) => void;

  /**
   * Creates an SFU for the specified room.
   * @param roomId The unique identifier for the room.
   * @param logger The logger instance for logging room-specific events.
   */
  constructor(roomId: string, logger: Logger, onCleanup: (id: string) => void) {
    this.#producer = null;
    this.#consumers = {} as Record<string, ConsumerPeer>;
    this.#roomId = roomId;
    this.#logger = logger.deriveLogger(`Room-${truncateString(roomId, 5)}`);
    this.#onCleanup = onCleanup;
  }

  /**
   * Gets the ID of the current producer.
   * @returns The ID of the producer or undefined if no producer exists. Note that we delete rooms after
   * the producer leaves, so this should never happen.
   */
  public get producerId() {
    return this.#producer?.id;
  }

  /**
   * Adds ICE candidate to the WebRTC connection based on the provided ID.
   * @param id The ID of the peer (producer or consumer).
   * @param candidate The ICE candidate to be added.
   * @returns A promise indicating whether the ICE candidate was successfully added.
   */
  addIceCandidate = async (id: string, candidate: RTCIceCandidate) => {
    if (id === this.#producer?.id) {
      this.#logger.debug('Add producer ice candidate.');
      await this.#producer.peer.addIceCandidate(candidate);
    } else {
      const consumer = this.#consumers[id];
      // The consumer is only added to the room after negotiation. In the event
      // that we receive an ICE candidate before negotiation, we ignore it since
      // it will be included in the SDP (and we have no way of adding it anyway).
      if (!consumer) {
        return false;
      }
      this.#logger.debug(`Add consumer [${id}] ice candidate.`);
      await consumer.peer.addIceCandidate(candidate);
    }
    return true;
  };

  /**
   * Adds a producer to the room, initiating the WebRTC connection.
   * @param id The ID of the producer.
   * @param sdp The Remote Session Description Protocol for negotiation.
   * @returns A promise resolving to the local SDP after negotiation.
   */
  addProducer = async (id: string, sdp: RTCSessionDescriptionInit) => {
    this.#producer = {
      id,
      stream: null,
      peer: createPeer(),
    };

    // Once we receive the stream, handle track additions and removals
    // and notifdy all consumers of the new streamer.
    this.#producer.peer.ontrack = (e) => {
      if (e.streams && e.streams[0] && this.#producer) {
        this.#producer.stream = e.streams[0];

        this.#producer.stream.onaddtrack = (e) => {
          // Add track to all consumers
          if (e.track) {
            this.#logger.debug(
              `Producer [${id}] added track [${e.track.label}]`,
            );
            Object.values(this.#consumers).forEach((consumer) =>
              consumer.peer.addTrack(e.track),
            );
          }
        };
        this.#producer.stream.onremovetrack = (e) => {
          // Remove track from all consumers
          if (e.track) {
            this.#logger.debug(
              `Producer [${id}] removed track [${e.track.label}]`,
            );
            Object.values(this.#consumers).forEach((consumer) => {
              const sender = consumer.tracks[e.track.label];
              sender && consumer.peer.removeTrack(sender);
            });
          }
        };

        // Notify all in room to connect.
        websocketManager.sockets[this.#roomId] &&
          Object.entries(websocketManager.sockets[this.#roomId]).forEach(
            ([socketId, socket]) => {
              if (socketId !== id) {
                socket.send(
                  JSON.stringify({
                    topic: WS_TOPICS.RTC_NEW_PRODUCER,
                    payload: {},
                  }),
                );
              }
            },
          );
      }
    };

    // Handle SDP negotiation
    const { localDescription } = await hookSignals(
      this.#producer.peer,
      sdp,
      id,
      this.#roomId,
      this.#logger,
      // OnClose Cleanup
      () => {
        this.#logger.debug(`Producer [${id}] peer disconnected`);
        this.#onCleanup(id);
      },
    );
    return localDescription;
  };

  /**
   * Adds a consumer to the room, establishing the WebRTC connection.
   * @param id The ID of the consumer.
   * @param sdp The Session Description Protocol for negotiation.
   * @returns A promise resolving to the local SDP after negotiation.
   */
  addConsumer = async (id: string, sdp: RTCSessionDescriptionInit) => {
    // Should be redundant, but double check that streamer exists.
    if (this.#producer === null || this.#producer.stream === null) {
      this.#logger.error(`Attempted to add consumer [${id}] with no producer!`);
      return null;
    }
    if (this.#consumers[id] !== undefined) {
      this.#logger.error(`Consumer [${id}] is already in room `);
      return null;
    }

    // Add producer stream tracks to consumer server peer
    const consumer = { id, peer: createPeer(), tracks: {} } as ConsumerPeer;
    this.#producer.stream.getTracks().forEach((track) => {
      this.#producer?.stream &&
        (consumer.tracks[track.label] = consumer.peer.addTrack(
          track,
          this.#producer.stream,
        ));
    });

    // Handle SDP negotiation
    const { localDescription } = await hookSignals(
      consumer.peer,
      sdp,
      id,
      this.#roomId,
      this.#logger,
      // OnClose Cleanup
      () => {
        this.#logger.debug(`Consumer [${id}] peer disconnected`);
        this.#onCleanup(id);
      },
    );
    // Only add the consumer after negotiation (to prevent adding ice candidates before acquiring the local description)
    this.#consumers[id] = consumer;
    return localDescription;
  };

  /**
   * Removes a consumer from the room, closing its WebRTC connection.
   * @param id The ID of the consumer to be removed.
   * @returns A boolean indicating whether the consumer was successfully removed.
   */
  removeConsumer = (id: string) => {
    const consumer = this.#consumers[id];
    if (consumer === undefined) {
      this.#logger.error(
        `Attempted to remove consumer [${id}] who is not in room`,
      );
      return false;
    }
    // Cleanup
    Object.values(consumer.tracks).forEach((sender) =>
      consumer.peer.removeTrack(sender),
    );
    consumer.peer.close();
    // Ok since we delete the consumer after removing it
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    consumer.peer = null;
    delete this.#consumers[id];
    return true;
  };

  /**
   * Removes the producer from the room, closing its WebRTC connection and notifying consumers.
   * @returns A boolean indicating whether the producer was successfully removed.
   */
  removeProducer = () => {
    this.#logger.debug(`Removing producer [${this.#producer?.id}] from room`);
    if (this.#producer === null) {
      this.#logger.debug(
        "Attempted to remove producer from room but there isn't one. Ignore if cleanup.",
      );
      return false;
    }

    // Notify all consumers to disconnect
    const sockets = websocketManager.sockets[this.#roomId];
    if (sockets === undefined) {
      this.#logger.error(`Failed to get sockets for room [${this.#roomId}]`);
    } else {
      Object.entries(sockets).forEach(([socketId, socket]) => {
        if (socketId !== this.#producer?.id) {
          socket.send(
            JSON.stringify({
              topic: WS_TOPICS.RTC_DISCONNECT_PRODUCER,
            }),
          );
          this.#logger.debug(`Removed consumer [${socketId}] from room`);
          this.removeConsumer(socketId);
        }
      });
    }

    // Remove all the consumer peers on the server cleanly
    if (Object.keys(this.#consumers).length !== 0) {
      this.#logger.error(`Found stale consumers in room [${this.#roomId}]`);
      Object.keys(this.#consumers).forEach((id) => this.removeConsumer(id));
    }
    // Cleanup
    this.#consumers = {};
    this.#producer.peer.close();
    // This is ok since we're removing the producer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.#producer.peer = null;
    this.#producer.stream = null;
    this.#producer = null;
    return true;
  };
}
