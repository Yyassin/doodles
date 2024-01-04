import { WebSocket } from 'ws';
import { HTTP_STATUS } from '../../constants';

const sendResponse = (
  socket: WebSocket,
  message: string,
  status: number = HTTP_STATUS.SUCCESS,
) => {
  socket.send(
    JSON.stringify({
      status,
      msg: message,
    }),
  );
};

/**
 * Send succesful message back to front end
 * @param socket WebSocket, the socket that sent original message
 * @param message String, the message
 */
export const sendSuccessResponse = (socket: WebSocket, message: string) =>
  sendResponse(socket, message, HTTP_STATUS.SUCCESS);

/**
 * Send error message back to front end
 * @param socket WebSocket, the socket that sent original message
 * @param message String, the message
 */
export const sendErrorResponse = (socket: WebSocket, message: string) =>
  sendResponse(socket, message, HTTP_STATUS.ERROR);
