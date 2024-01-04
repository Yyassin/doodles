/**
 * Define a class that has functionalities to interact with websocket server.
 * @authors Abdalla Abdelhadi, Yousef Yassin
 */

import {
  WS_URL,
  HTTP_STATUS,
  WS_RECONNECT_INTERVAL,
  SECONDS_TO_MS,
} from '@/constants';
import { CanvasElement } from '@/stores/CanvasElementsStore';
import { EVENT } from './types';
import { ValueOf } from './lib/misc';

interface CallBacksType {
  addCanvasShape: (element: CanvasElement) => void;
  addCanvasFreehand: (element: CanvasElement) => void;
}

interface WSMessageType {
  topic: keyof CallBacksType;
  payload: CanvasElement;
  status?: ValueOf<typeof HTTP_STATUS>;
  msg?: string;
}

//class that provides functionality to interact with websockets
export default class WebsocketClient {
  userId: string;
  reconnectInterval: number;
  socket: WebSocket | null;
  room: string | null; //the current room the socket is in
  callBacks: CallBacksType;
  msgTemplate = {
    topic: null,
    room: null,
    payload: null,
  }; //to be changed once we finalize the contents of the msg

  /**
   * Creates new WebsocketClient instance
   */
  constructor(
    callBacks: CallBacksType,
    userId: string,
    reconnectInterval = WS_RECONNECT_INTERVAL,
  ) {
    this.socket = null;
    this.room = null;
    this.callBacks = callBacks;
    this.userId = userId;
    this.reconnectInterval = reconnectInterval;
    this.connect(); // Create a socket
  }

  /**
   * Asychronous promise that resolves when the socket
   * is open, we block on this (without blocking the main thread)
   * to ensure we don't attempt to send messages on a closed
   * connection, since that throws.
   * @returns Promise, resolved when connected, or rejects after max attempts.
   */
  private waitForOpenConnection = (maximumAttempts = 10) => {
    return new Promise((resolve, reject) => {
      const intervalTime = 200; // ms

      let currentAttempt = 0;
      const interval = setInterval(() => {
        if (currentAttempt > maximumAttempts - 1) {
          clearInterval(interval);
          reject(new Error('Maximum number of attempts exceeded'));
        } else if (this.socket?.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          resolve(true);
        }
        currentAttempt++;
      }, intervalTime);
    });
  };

  /**
   * Guard that throws error if socket is not initalized
   */
  private checkSocket(): this is { socket: WebSocket } {
    if (this.socket === undefined) {
      console.error('Socket not initalized');
      return false;
    }
    return true;
  }

  /**
   * Mehtod that initalizes socket and sets listeners
   */
  connect() {
    if (
      this.socket &&
      !([WebSocket.CLOSING, WebSocket.CLOSED] as number[]).includes(
        this.socket.readyState,
      )
    ) {
      throw 'Socket is already initalized';
    }

    this.socket = new WebSocket(WS_URL);

    this.socket.addEventListener(EVENT.OPEN, () => {
      return;
    });

    // Attempt to reconnect on close.
    this.socket.addEventListener(EVENT.CLOSE, (event) => {
      console.log(
        `Socket is closed (code: ${
          event.code
        }). Reconnect will be attempted in ${(
          this.reconnectInterval / SECONDS_TO_MS
        ).toFixed(0)} seconds.`,
        event.reason,
      );
      setTimeout(() => {
        if (this.socket?.readyState === WebSocket.CLOSED) {
          console.log('Trying to reconnect.');
          this.connect();
        }
      }, this.reconnectInterval);
    });

    this.socket.addEventListener(EVENT.ERROR, () => {
      console.log('Error Occured');
      this.socket?.close();
    });

    this.socket.addEventListener(EVENT.MESSAGE, (msg) => {
      const jsonMsg = JSON.parse(msg.data) as WSMessageType;

      if (jsonMsg.status !== undefined) {
        if (jsonMsg.status === HTTP_STATUS.SUCCESS) {
          console.log(jsonMsg.msg);
        } else {
          throw jsonMsg.msg; //throw the error message received from server
        }
        return;
      }

      this.callBacks[jsonMsg.topic](jsonMsg.payload);
    });
  }

  async send(msg: object) {
    if (!this.checkSocket()) return;
    try {
      await this.waitForOpenConnection();
      this.socket.send(
        JSON.stringify({
          ...this.msgTemplate,
          ...msg,
          room: this.room,
          id: this.userId,
        }),
      );
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Method that disconnects the socket
   */
  disconnect() {
    this.checkSocket();
    this.room !== null && this.leaveRoom(); //leave room before closing socket

    this.socket?.close();
    this.socket = null;
  }

  /**
   * Send message to the room the socket is in
   *
   * @param msg String, the message to be sent to the room
   */
  async sendMsgRoom(topic: string, msg: CanvasElement) {
    // Msg to be changed to proper type once everything finalized
    if (this.room === null) throw 'No room assigned!';
    return this.send({
      ...this.msgTemplate,
      topic: topic,
      room: this.room,
      payload: msg,
      id: this.userId,
    });
  }

  /**
   * Metthod to Join room
   *
   * @param room String, the room id
   */
  async joinRoom(room: string) {
    this.room = room;
    return this.send({
      topic: 'joinRoom',
    });
  }

  /**
   * Method that leaves room
   */
  async leaveRoom() {
    if (this.room === null) throw "Socket isn't in a room";
    await this.send({
      topic: 'leaveRoom',
    });
    this.room = null;
  }
}
