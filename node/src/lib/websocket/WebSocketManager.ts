import { RawData, WebSocket } from 'ws';
import http from 'http';
import { Singleton } from '../../utils/Singleton';
import helpers from './websocketHelpers';
import { Logger } from '../../utils/Logger';
import { LOG_LEVEL } from '../../constants';

const { sendErrorResponse, sendSuccessResponse } = helpers;

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
 * Define and setup websocket server
 * @author Abdalla Abdelhadi
 */

// Singleton better than static for testing.
class WebSocketManager extends Singleton<WebSocketManager>() {
  #wss = new WebSocket.Server({ noServer: true });
  #sockets = {} as Record<string, Record<string, WebSocket>>;
  #logger = new Logger(WebSocketManager.name, LOG_LEVEL);
  callbacks = {} as Record<string, WSCallback>;

  constructor() {
    super();
    this.#logger.debug('Instantiated.');
  }

  public init(server: http.Server) {
    // Add socket to room specified
    this.on('joinRoom', ({ socket, room, id }) => {
      if (this.sockets[room] === undefined) {
        this.sockets[room] = {};
      } else if (this.sockets[room][id]) {
        return sendErrorResponse(socket, 'Socket already in room!');
      }
      this.sockets[room][id] = socket;
      return sendSuccessResponse(socket, 'Socket joined room!');
    });
    // Remove socket from room
    this.on('leaveRoom', ({ socket, room, payload, id }) => {
      this.callbacks['preLeaveRoom'] &&
        this.callbacks['preLeaveRoom']({ socket, room, payload, id });
      if (!(this.sockets[room] && this.sockets[room][id])) {
        return sendErrorResponse(socket, 'Socket already is not room!');
      }
      delete this.sockets[room][id];
      return sendSuccessResponse(socket, 'Socket left room!');
    });
    this.initWSS(server);
    this.#logger.info('Websocket server running on server.');
  }

  public get sockets() {
    return this.#sockets;
  }

  public on(handle: string, callback: WSCallback) {
    this.callbacks[handle] = callback;
  }

  private handleMsg = (socket: WebSocket, msg: RawData) => {
    // Parse message to JSON
    const jsonMsg = JSON.parse(Buffer.from(msg as ArrayBuffer).toString());
    const { topic, room, payload, id } = jsonMsg;

    if (room === undefined && topic !== 'joinRoom') {
      const err = 'Received non-join message without room, ignoring!';
      this.#logger.error(err);
      return sendErrorResponse(socket, err);
    }

    const callback = this.callbacks[topic];
    if (callback === undefined) {
      // Send message and topic to sockets in room
      return Object.values(this.sockets[room]).forEach((roomSocket) => {
        if (socket != roomSocket) {
          roomSocket.send(JSON.stringify({ topic: topic, payload: payload }));
        }
      });
    }
    callback({ socket, room, payload, id });
  };

  private initWSS(server: http.Server) {
    //handles upgrade of request
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

    //upon connection, register callbacks
    this.#wss.on('connection', (socket) => {
      socket.on('message', (msg) => this.handleMsg(socket, msg));

      socket.on('close', () => {
        sendSuccessResponse(socket, 'Socket closed!');
      });

      //Send a succes message
      sendSuccessResponse(socket, 'Socket Created!');
    });
  }
}

export const websocketManager = WebSocketManager.Instance;
export default WebSocketManager;
