/**
 * Define test cases for ../src/websocket.ts
 * @author Abdalla Abdelhadi
 */

import 'mocha';
import { expect } from 'chai';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../src/lib/websocket/websocketHelpers';
import { RawData, WebSocket } from 'ws';

//Sockets interface, stores sockets and the room they are in
interface socketsType {
  [id: string]: Set<WebSocket>;
}

//The storage of the rooms and the sockets inside
export const sockets: socketsType = {};

/**
 * Handles all the recieved message from frontend
 * @param socket Websocket, the socket from frontend that send the message
 * @param msg RawData, the message from the socket
 */
export const handleMsg = (socket: WebSocket, msg: RawData) => {
  //Convert message to JSON
  const jsonMsg = JSON.parse(Buffer.from(msg as ArrayBuffer).toString());

  const { topic, room, payload } = jsonMsg;
  console.log(topic, room, payload);

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
        if (socket !== roomSocket) {
          roomSocket.send(JSON.stringify({ topic: topic, payload: payload }));
        }
      });
      return;
    }
  }
};

// WebSocket connection stub
class SocketStub {
  #data: unknown[];

  /**
   * Creates a new Socket instance.
   */
  constructor() {
    this.#data = [];
  }

  /**
   * emulate sending message to socket
   * @param data, the data being sent.
   */
  send(data: unknown) {
    this.#data.push(data);
  }

  /**
   * Returns the data received by this socket
   * @returns any[], the received data.
   */
  getData(): unknown[] {
    return this.#data;
  }
}

/**
 * Tests that WebSocket server works as intended
 */
describe('WebSocket Client', () => {
  it('ws::Should process message', () => {
    // Initialization
    const room = 'room1';
    const ws = new SocketStub();
    const ws2 = new SocketStub();

    expect(ws.getData().length).to.equal(0);

    // Helper to encode json into byte array
    const rawData = (json: object) => {
      return Buffer.from(JSON.stringify(json));
    };

    // Send a joinRoom request
    expect(Object.keys(sockets).length).to.equal(0);
    console.log('Sending request to join room: ' + room);
    handleMsg(
      ws as unknown as WebSocket,
      rawData({
        topic: 'joinRoom',
        room: room,
      }),
    );
    // Should have a new socket and a success response.
    expect(Object.keys(sockets).length).to.equal(1);
    expect(ws.getData().length).equal(1); // succes response
    console.log('Got response');
    console.log(ws.getData()[0]);

    // Again with another socket
    console.log('Sending request to join room: ' + room);
    handleMsg(
      ws2 as unknown as WebSocket,
      rawData({
        topic: 'joinRoom',
        room: room,
      }),
    );
    // Should have a new socket and a success response.
    expect(Object.keys(sockets).length).to.equal(1);
    expect(ws2.getData().length).equal(1); // succes response
    console.log('Got response');
    console.log(ws2.getData()[0]);

    // Send a message to room
    handleMsg(
      ws2 as unknown as WebSocket,
      rawData({
        topic: 'sendMsg',
        room: room,
        payload: 'hi',
      }),
    );

    console.log('Sending message to room');
    expect(ws.getData().length).equal(2);
    console.log('No additional responses');
    console.log(ws.getData());

    // Send another message to specified room
    const messageToClient = {
      topic: 'topic-name',
      room: room,
      payload: 'hi',
    };
    console.log('Sending message to room 2.0');
    console.log('CLIENT SENT');
    console.log(messageToClient);
    handleMsg(ws2 as unknown as WebSocket, rawData(messageToClient));

    const msgReceive = {
      topic: messageToClient.topic,
      payload: messageToClient.payload,
    };
    expect(ws.getData().length).equal(3);

    // Acheck the recieved message
    const actualReceive = JSON.parse(ws.getData()[2] as string);
    expect(actualReceive).to.deep.equal(msgReceive);
    console.log('RECEIVED');
    console.log(actualReceive);
  });
});
