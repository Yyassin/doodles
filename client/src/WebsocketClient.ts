/**
 * Define a class that has functionalities to interact with websocket server.
 * @authors Abdalla Abdelhadi, Yousef Yassin
 */

import {
  WS_URL,
  HTTP_STATUS,
  WS_RECONNECT_INTERVAL,
  SECONDS_TO_MS,
  WS_TOPICS,
} from '@/constants';
import { CanvasElement } from '@/stores/CanvasElementsStore';
import { EVENT } from './types';
import { ValueOf } from './lib/misc';

interface CallBacksType {
  addCanvasShape: (element: CanvasElement) => void;
  addCanvasFreehand: (element: CanvasElement) => void;
  editCanvasElement: (element: CanvasElement) => void;
  undoCanvasHistory: () => void;
  redoCanvasHistory: () => void;
}

interface WSMessageType {
  topic: keyof CallBacksType;
  payload: CanvasElement;
  status?: ValueOf<typeof HTTP_STATUS>;
  msg?: string;
}

// Encapsualtes functionality to interact with websockets
export default class WebsocketClient {
  userId: string;
  reconnectInterval: number;
  socket: WebSocket | null;
  room: string | null; //the current room the socket is in
  callBacks: CallBacksType;
  injectableCallbacks: Record<string, (payload: unknown) => void>;
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
    this.injectableCallbacks = {};
    this.userId = userId;
    this.reconnectInterval = reconnectInterval;
    this.connect(); // Create a socket
  }

  /**
   * Method that adds a callback function for a specific handle.
   * @param handle String, the handle to identify the callback.
   * @param callback Function, the callback function to be executed.
   */
  public on(handle: string, callback: (payload: unknown) => void) {
    this.injectableCallbacks[handle] = callback;
  }

  /**
   * Asynchronous promise that resolves when the socket is open.
   * It blocks on this to ensure messages are sent on an open connection.
   * @param maximumAttempts Number, the maximum number of attempts to connect.
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

      const injectableCallbacks = this.injectableCallbacks[jsonMsg.topic];
      if (injectableCallbacks !== undefined) {
        injectableCallbacks(jsonMsg);
      } else {
        this.callBacks[jsonMsg.topic](jsonMsg.payload);
      }
    });
  }

  /**
   * Method that sends a message over the WebSocket connection.
   * @param msg Object, the message object to be sent.
   */
  async send(msg: object) {
    if (!this.checkSocket()) return;
    try {
      await this.waitForOpenConnection();
      this.socket.send(
        JSON.stringify({
          ...this.msgTemplate,
          room: this.room,
          id: this.userId,
          ...msg,
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
  async sendMsgRoom(
    topic: string,
    msg: CanvasElement | string | string[] | object | null,
  ) {
    // Msg to be changed to proper type once everything finalized
    if (this.room === null) throw 'No room assigned!';
    return this.send({
      ...this.msgTemplate,
      topic: topic,
      payload: msg,
      room: this.room,
      id: this.userId,
    });
  }

  /**
   * Method to Join room
   *
   * @param room String, the room id
   */
  async joinRoom(room: string) {
    this.room = room;
    return this.send({
      topic: WS_TOPICS.JOIN_ROOM,
      room: this.room,
      id: this.userId,
    });
  }

  /**
   * Method that leaves room
   */
  async leaveRoom() {
    if (this.room === null) throw "Socket isn't in a room";
    this.checkSocket();
    await this.send({
      topic: WS_TOPICS.LEAVE_ROOM,
      room: this.room,
      id: this.userId,
    });
    this.room = null;
  }

  /**
   * Method that sends a message indicating the end of this client's WebRTC session.
   */
  async rtcEnd() {
    if (this.room === null) throw "Socket isn't in a room";
    this.checkSocket();
    return this.send({
      topic: WS_TOPICS.RTC_END_CALL,
      room: this.room,
      id: this.userId,
    });
  }

  /**
   * Method that sends an ICE candidate for WebRTC communication.
   * @param candidate RTCIceCandidate, the ICE candidate to send.
   */
  async iceCandidate(candidate: RTCIceCandidate) {
    this.checkSocket();
    return this.send({
      topic: WS_TOPICS.ICE_CANDIDATE,
      payload: { candidate },
      room: this.room,
      id: this.userId,
    });
  }
}
