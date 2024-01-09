import { RawData, WebSocket } from 'ws';
import http from 'http';
import { Singleton } from '../../utils/Singleton';
import helpers from './websocketHelpers';
import { Logger } from '../../utils/Logger';
import { LOG_LEVEL, WS_TOPICS, preLeaveRoomTopic } from '../../constants';

const { sendErrorResponse, sendSuccessResponse } = helpers;

/**
 * Defines WebSocket Manager to manage connections, rooms, and message handling.
 * @authors Abdalla Abdelhadi, Yousef Yassin
 */

/**
 * WSCallback Type
 * Defines the callback function signature for WebSocket events.
 */
export type WSCallback = ({
  socket,
  room,
  payload,
  id,
}: {
  socket: WebSocket;
  room: string;
  payload: string;
  id: string;
}) => void;

/**
 * Encapsulates WebSocket connection management and provides functionality
 * for joining, leaving rooms, and handling messages.
 */ class WebSocketManager extends Singleton<WebSocketManager>() {
  #wss = new WebSocket.Server({ noServer: true });
  #sockets = {} as Record<string, Record<string, WebSocket>>;
  #logger = new Logger(WebSocketManager.name, LOG_LEVEL);
  callbacks = {} as Record<string, WSCallback>;

  /** Creates a new WebSocket Manager instance */
  constructor() {
    super();
    this.#logger.debug('Instantiated.');
  }

  /**
   * Initializes the WebSocketManager with the provided HTTP server.
   * @param server The HTTP server instance.
   */
  public init(server: http.Server) {
    // Add socket to room specified
    this.on(WS_TOPICS.JOIN_ROOM, ({ socket, room, id }) => {
      if (this.sockets[room] === undefined) {
        this.sockets[room] = {};
      } else if (this.sockets[room][id]) {
        return sendErrorResponse(socket, 'Socket already in room!');
      }
      this.sockets[room][id] = socket;
      return sendSuccessResponse(socket, 'Socket joined room!');
    });
    // Remove socket from room
    this.on(WS_TOPICS.LEAVE_ROOM, ({ socket, room, payload, id }) => {
      this.callbacks[preLeaveRoomTopic] &&
        this.callbacks[preLeaveRoomTopic]({ socket, room, payload, id });
      if (!(this.sockets[room] && this.sockets[room][id])) {
        return sendErrorResponse(socket, 'Socket already is not room!');
      }
      delete this.sockets[room][id];
      return sendSuccessResponse(socket, 'Socket left room!');
    });
    this.initWSS(server);
    this.#logger.info('Websocket server running on server.');
  }

  /**
   * Gets the WebSocket instances grouped by room.
   * @returns The WebSocket instances.
   */
  public get sockets() {
    return this.#sockets;
  }

  /**
   * Registers a callback function for a WebSocket message topic.
   * @param handle The event handle or topic.
   * @param callback The callback function.
   */
  public on(handle: string, callback: WSCallback) {
    this.callbacks[handle] = callback;
  }

  /**
   * Handles incoming WebSocket messages.
   * @param socket The WebSocket instance.
   * @param msg The raw message data.
   */
  private handleMsg = (socket: WebSocket, msg: RawData) => {
    // Parse message to JSON
    const jsonMsg = JSON.parse(Buffer.from(msg as ArrayBuffer).toString());
    const { topic, room, payload, id } = jsonMsg;

    // The only message that can be received without a room is join-room
    if (room === undefined && topic !== WS_TOPICS.JOIN_ROOM) {
      const err = 'Received non-join message without room, ignoring!';
      this.#logger.error(err);
      return sendErrorResponse(socket, err);
    }

    const callback = this.callbacks[topic];
    if (callback === undefined) {
      const sockets = this.sockets[room];
      if (sockets === undefined) {
        this.#logger.error(`Tried to broadcast to undefined room [${room}]`);
        return;
      }
      // Send message and topic to sockets in room
      return Object.values(sockets).forEach((roomSocket) => {
        if (socket != roomSocket) {
          roomSocket.send(JSON.stringify({ topic, payload }));
        }
      });
    }
    callback({ socket, room, payload, id });
  };

  /**
   * Initializes the WebSocket Server and handles upgrade and connection events.
   * @param server The HTTP server instance.
   */
  private initWSS(server: http.Server) {
    // Handles upgrade of request
    server.on('upgrade', (req, socket, head) => {
      try {
        this.#wss.handleUpgrade(req, socket, head, (ws) => {
          this.#wss.emit('connection', ws, req);
        });
      } catch (err) {
        socket.destroy();
        return;
      }
    });

    // Upon connection, register callbacks
    this.#wss.on('connection', (socket) => {
      socket.on('message', (msg) => this.handleMsg(socket, msg));

      socket.on('close', () => {
        sendSuccessResponse(socket, 'Socket closed!');
      });

      // Send a succes message
      sendSuccessResponse(socket, 'Socket Created!');
    });
  }
}

// Create a singleton instance of WebSocketManager
export const websocketManager = WebSocketManager.Instance;
export default WebSocketManager;
