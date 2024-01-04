import { RawData, WebSocket } from 'ws';
import http from 'http';
import { Singleton } from '../../utils/Singleton';
import helpers from './websocketHelpers';
const { sendErrorResponse, sendSuccessResponse } = helpers;

/**
 * Define and setup websocket server
 * @author Abdalla Abdelhadi
 */

class WebSocketManager extends Singleton<WebSocketManager>() {
  #wss = new WebSocket.Server({ noServer: true });
  #sockets = {} as Record<string, Set<WebSocket>>;
  callbacks = {} as Record<
    string,
    ({
      socket,
      room,
      payload,
    }: {
      socket: WebSocket;
      room: string;
      payload: string;
    }) => void
  >;

  public init(server: http.Server) {
    // Add socket to room specified
    this.on('joinRoom', ({ socket, room }) => {
      if (this.#sockets[room] === undefined) {
        this.#sockets[room] = new Set();
      } else if (this.#sockets[room].has(socket)) {
        return sendErrorResponse(socket, 'Socket already in room!');
      }
      this.#sockets[room].add(socket);
      return sendSuccessResponse(socket, 'Socket joined room!');
    });
    // Remove socket from room
    this.on('leaveRoom', ({ socket, room }) => {
      if (!this.#sockets[room].has(socket)) {
        return sendErrorResponse(socket, 'Socket already is not room!');
      }
      this.#sockets[room].delete(socket);
      return sendSuccessResponse(socket, 'Socket left room!');
    });
    this.initWSS(server);
    console.log('Websocket server running on server.');
  }

  public get sockets() {
    return this.#sockets;
  }

  public on(
    handle: string,
    callback: ({
      socket,
      room,
      payload,
    }: {
      socket: WebSocket;
      room: string;
      payload: string;
    }) => void,
  ) {
    this.callbacks[handle] = callback;
  }

  private handleMsg = (socket: WebSocket, msg: RawData) => {
    // Parse message to JSON
    const jsonMsg = JSON.parse(Buffer.from(msg as ArrayBuffer).toString());
    const { topic, room, payload } = jsonMsg;

    if (room === undefined && !['leaveRoom', 'joinRoom'].includes(topic)) {
      const err = 'Received non-join message without room, ignoring!';
      console.error(err);
      return sendErrorResponse(socket, err);
    }

    const callback = this.callbacks[topic];
    if (callback === undefined) {
      // Send message and topic to sockets in room
      return this.#sockets[room].forEach((roomSocket) => {
        if (socket != roomSocket) {
          roomSocket.send(JSON.stringify({ topic: topic, payload: payload }));
        }
      });
    }
    callback({ socket, room, payload });
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

export default WebSocketManager;
