import { ConsumerPeer, StreamerPeer } from '../../types';
import { Logger } from '../../utils/Logger';
import { truncateString } from '../../utils/misc';
import { websocketManager } from '../websocket/WebSocketManager';
import { createPeer, hookSignals } from './wrtcHelpers';

export class RoomSFU {
  #producer: StreamerPeer | null;
  #consumers: Record<string, ConsumerPeer>;
  #roomId: string;
  #logger: Logger;

  constructor(roomId: string, logger: Logger) {
    this.#producer = null;
    this.#consumers = {} as Record<string, ConsumerPeer>;
    this.#roomId = roomId;
    this.#logger = logger.deriveLogger(`Room-${truncateString(roomId, 5)}`);
  }

  public get producerId() {
    return this.#producer?.id;
  }

  addIceCandidate = async (id: string, candidate: RTCIceCandidate) => {
    if (id === this.#producer?.id) {
      this.#logger.debug('Add producer ice candidate.');
      await this.#producer.peer.addIceCandidate(candidate);
    } else {
      const consumer = this.#consumers[id];
      // Only set after handshake, will be in offer
      if (!consumer) {
        return false;
      }
      this.#logger.debug(`Add consumer [${id}] ice candidate.`);
      await consumer.peer.addIceCandidate(candidate);
    }
    return true;
  };

  addProducer = async (id: string, sdp: RTCSessionDescriptionInit) => {
    this.#producer = {
      id,
      stream: null,
      peer: createPeer(),
    };

    // Once we receive the stream, notify all in room to connect.
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
          // Add track to all consumers
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

        websocketManager.sockets[this.#roomId] &&
          Object.entries(websocketManager.sockets[this.#roomId]).forEach(
            ([socketId, socket]) => {
              if (socketId !== id) {
                socket.send(
                  JSON.stringify({ topic: 'webrtc-new-streamer', payload: {} }),
                );
              }
            },
          );
      }
    };

    const { localDescription } = await hookSignals(
      this.#producer.peer,
      sdp,
      id,
      this.#roomId,
      this.#logger,
    );
    return localDescription;
  };

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

    // Add producer streamers to consumer
    const consumer = { id, peer: createPeer(), tracks: {} } as ConsumerPeer;
    this.#producer.stream.getTracks().forEach((track) => {
      this.#producer?.stream &&
        (consumer.tracks[track.label] = consumer.peer.addTrack(
          track,
          this.#producer.stream,
        ));
    });

    const { localDescription } = await hookSignals(
      consumer.peer,
      sdp,
      id,
      this.#roomId,
      this.#logger,
    );
    // Only add the consumer after negotiation (to prevent adding ice candidates beforehand)
    this.#consumers[id] = consumer;
    return localDescription;
  };

  removeConsumer = (id: string) => {
    const consumer = this.#consumers[id];
    if (consumer === undefined) {
      this.#logger.error(
        `Attempted to remove consumer [${id}] who is not in room`,
      );
      return false;
    }
    Object.values(consumer.tracks).forEach((sender) =>
      consumer.peer.removeTrack(sender),
    );
    consumer.peer.close();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    consumer.peer = null;
    delete this.#consumers[id];
    return true;
  };

  removeProducer = () => {
    if (this.#producer === null) {
      this.#logger.error(
        "Attempted to remove producer from room but there isn't one. This should never happen.",
      );
      return false;
    }

    Object.entries(websocketManager.sockets[this.#roomId]).forEach(
      ([socketId, socket]) => {
        if (socketId !== this.#producer?.id) {
          socket.send(
            JSON.stringify({
              topic: 'webrtc-disconnect-streamer',
            }),
          );
          this.#logger.debug(`Removed consumer [${socketId}] from room`);
          this.removeConsumer(socketId);
        }
      },
    );
    if (Object.keys(this.#consumers).length !== 0) {
      this.#logger.error(`Found stale consumers in room [${this.#roomId}]`);
      Object.keys(this.#consumers).forEach((id) => this.removeConsumer(id));
    }

    this.#consumers = {};
    this.#producer.peer.close();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.#producer.peer = null;
    this.#producer.stream = null;
    this.#producer = null;
    return true;
  };
}
