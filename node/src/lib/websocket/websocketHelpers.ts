import { WebSocket } from 'ws';
import { HTTP_STATUS } from '../../constants';

/**
 * Defines general helper functions for WebSocket communication.
 * @authors Abdalla Abdelhadi, Yousef Yassin
 */

/**
 * Sends a response to the front end with the specified status and message.
 * @param socket The WebSocket to send the response to.
 * @param message The message to send.
 * @param status The status code to send.
 */
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
const sendSuccessResponse = (socket: WebSocket, message: string) =>
  sendResponse(socket, message, HTTP_STATUS.SUCCESS);

/**
 * Send error message back to front end
 * @param socket WebSocket, the socket that sent original message
 * @param message String, the message
 */
const sendErrorResponse = (socket: WebSocket, message: string) =>
  sendResponse(socket, message, HTTP_STATUS.ERROR);

const helpers = { sendErrorResponse, sendSuccessResponse };
export default helpers;
