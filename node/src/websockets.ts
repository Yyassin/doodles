/**
 * Define and setup websocket server
 * @author Abdalla Abdelhadi
 */

import { RawData, WebSocket } from 'ws';
import http from 'http';

//Webscoket response status
const enum status {
  SUCCESS = 200,
  ERROR = 400,
}

//Sockets interface, stores sockets and the room they are in
interface socketsType {
  [id: string]: Set<WebSocket>;
}

//The storage of the rooms and the sockets inside
export const sockets: socketsType = {};

/**
 * Sets up the websocket server and binds it to the server
 * @param server http.Server, the server in which backend is running on
 */
const setUpWSS = (server: http.Server) => {
  const wss = new WebSocket.Server({ noServer: true });

  //handles upgrade of request
  server.on('upgrade', (req, socket, head) => {
    try {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } catch (err) {
      socket.destroy();
      return;
    }
  });

  //upon connection, register callbacks
  wss.on('connection', (socket) => {
    socket.on('message', (msg) => handleMsg(socket, msg));

    socket.on('close', () => {
      sendSuccessResponse(socket, 'Socket closed!');
    });

    //Send a succes message
    sendSuccessResponse(socket, 'Socket Created!');
  });
};

export default setUpWSS;

/**
 * Handles all the recieved message from frontend
 * @param socket Websocket, the socket from frontend that send the message
 * @param msg RawData, the message from the socket
 */
export const handleMsg = (socket: WebSocket, msg: RawData) => {
  //Convert message to JSON
  const jsonMsg = JSON.parse(Buffer.from(msg as ArrayBuffer).toString());

  const { topic, room, payload } = jsonMsg;

  switch (topic) {
    //add socket to room specified
    case 'joinRoom': {
      if (sockets[room] === undefined) {
        sockets[room] = new Set();
      } else if (sockets[room].has(socket)) {
        sendErrorResponse(socket, 'Socket already in room!');
        return;
      }
      sockets[room].add(socket);
      sendSuccessResponse(socket, 'Socket joined room!');
      return;
    }
    //remove socket from room
    case 'leaveRoom': {
      if (!sockets[room].has(socket)) {
        sendErrorResponse(socket, 'Socket already is not room!');
        return;
      }
      sockets[room].delete(socket);
      sendSuccessResponse(socket, 'Socket left room!');
      return;
    }
    //send message and topic to sockets in room
    default: {
      sockets[room].forEach((roomSocket) => {
        if (socket != roomSocket) {
          roomSocket.send(JSON.stringify({ topic: topic, payload: payload }));
        }
      });
      return;
    }
  }
};

/**
 * Send succesful message back to front end
 * @param socket WebSocket, the socket that sent original message
 * @param message String, the message
 */
const sendSuccessResponse = (socket: WebSocket, message: string) => {
  socket.send(
    JSON.stringify({
      status: status.SUCCESS,
      msg: message,
    }),
  );
};

/**
 * Send error message back to front end
 * @param socket WebSocket, the socket that sent original message
 * @param message String, the message
 */
const sendErrorResponse = (socket: WebSocket, message: string) => {
  socket.send(
    JSON.stringify({
      status: status.ERROR,
      msg: message,
    }),
  );
};
