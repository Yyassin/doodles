/**
 * Define test cases for ../src/websocket.ts
 * @author Abdalla Abdelhadi
 */

import 'mocha';
import { expect } from 'chai';
import { sockets, handleMsg } from '../src/websockets';

// WebSocket connection stub
class SocketStub {
  #data: any[];

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
  send(data: any) {
    this.#data.push(data);
  }

  /**
   * Returns the data received by this socket
   * @returns any[], the received data.
   */
  getData(): any[] {
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

    expect(ws.getData().length).to.equal(0);

    // Helper to encode json into byte array
    const rawData = (json: object) => {
      return Buffer.from(JSON.stringify(json));
    };

    // Send a joinRoom request
    expect(Object.keys(sockets).length).to.equal(0);
    console.log('Sending request to join room: ' + room);
    handleMsg(
      ws as any,
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

    // Send a message to room
    handleMsg(
      ws as any,
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
    handleMsg(ws as any, rawData(messageToClient));

    const msgReceive = {
      topic: messageToClient.topic,
      payload: messageToClient.payload,
    };
    expect(ws.getData().length).equal(3);

    // Acheck the recieved message
    const actualReceive = JSON.parse(ws.getData()[2]);
    expect(actualReceive).to.deep.equal(msgReceive);
    console.log('RECEIVED');
    console.log(actualReceive);
  });
});
