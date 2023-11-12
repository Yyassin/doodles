/**
 * Define a class that has basic functionalities to interact with websockets
 * @author Abdalla Abdelhadi
 */

import { WS_URL } from '@/constants';
import { CanvasElement } from '@/stores/CanvasElementsStore';
// import { Actions } from '@/stores/WebSocketStore';

//websocket response status
const enum status {
  SUCCESS = 200,
  ERROR = 400,
}

interface CallBacksType {
  addCanvasShape: (element: CanvasElement) => void;
  addCanvasFreehand: (element: CanvasElement) => void;
}

interface msgType {
  topic: keyof CallBacksType;
  payload: CanvasElement;
  status?: status;
  msg?: string;
}

//class that provides functionality to interact with websockets
export default class WebsocketClient {
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
  constructor(callBacks: CallBacksType) {
    this.socket = null;
    this.room = null;
    this.callBacks = callBacks;

    this.connect(); //create a socket
  }

  /**
   * Private class that throws arror if socket is not initalized
   */
  private checkSocket() {
    if (!this.socket) {
      throw 'Socket not initalized';
    }
  }

  /**
   * Mehtod that initalizes socket and sets listeners
   */
  connect() {
    if (this.socket) {
      throw 'Socket is already initalized';
    }

    this.socket = new WebSocket(WS_URL);

    this.socket.addEventListener('open', () => {
      return;
    });

    this.socket.addEventListener('close', () => {
      console.log('Socket Closed');
    });

    this.socket.addEventListener('error', () => {
      console.log('Error Occured');
    });

    this.socket.addEventListener('message', (msg) => {
      const jsonMsg: msgType = JSON.parse(msg.data);

      if (jsonMsg.status !== undefined) {
        if (jsonMsg.status === status.SUCCESS) {
          console.log(jsonMsg.msg);
        } else {
          throw jsonMsg.msg; //throw the error message received from server
        }
        return;
      }

      console.log(jsonMsg.payload.freehandPoints);
      this.callBacks[jsonMsg.topic](jsonMsg.payload);
    });
  }

  /**
   * Method that disconnects the socket
   */
  disconnect() {
    this.checkSocket();
    if (this.room !== null) this.leaveRoom(); //leave room before closing socket

    this.socket?.close();
    this.socket = null;
  }

  /**
   * Send message to the room the socket is in
   *
   * @param msg String, the message to be sent to the room
   */
  sendMsgRoom(topic: string, msg: CanvasElement) {
    //msg to be changed to proper type once everything finalized
    this.checkSocket();

    if (this.room === null) throw 'No room assigned!';

    this.socket?.send(
      JSON.stringify({
        ...this.msgTemplate,
        topic: topic,
        room: this.room,
        payload: msg,
      }),
    );
  }

  /**
   * Metthod to Join room
   *
   * @param room String, the room id
   */
  joinRoom(room: string) {
    this.checkSocket();

    this.room = room;

    this.socket?.send(
      JSON.stringify({
        ...this.msgTemplate,
        topic: 'joinRoom',
        room: this.room,
      }),
    );
  }

  /**
   * Method that leaves room
   */
  leaveRoom() {
    this.checkSocket();
    if (this.room === null) throw "Socket isn't in a room";

    this.socket?.send(
      JSON.stringify({
        ...this.msgTemplate,
        topic: 'leaveRoom',
        room: this.room,
      }),
    );

    this.room = null;
  }
}
