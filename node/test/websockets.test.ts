import * as sinon from 'sinon';
import { expect } from 'chai';
import http from 'http';
import WebsocketHelper from '../src/lib/websocket/websocketHelpers';

let sendSuccessResponseStub = sinon
  .stub(WebsocketHelper, 'sendSuccessResponse' as any)
  .returns('Socket left room!');
let sendErrorResponseStub = sinon
  .stub(WebsocketHelper, 'sendErrorResponse' as any)
  .returns('Error response sent');

import WebSocketManager from '../src/lib/websocket/WebSocketManager';

// Helper to encode json into byte array
const rawData = (json: object) => {
  return Buffer.from(JSON.stringify(json));
};

// WebSocket connection stub
class MockWebSocket {
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

describe('WebSocketManager', () => {
  const id = 'anId';
  let server: http.Server;
  let webSocketManager: WebSocketManager;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    server = http.createServer();
    webSocketManager = WebSocketManager.Instance;
  });

  afterEach(() => {
    sendSuccessResponseStub.resetHistory();
    sendErrorResponseStub.resetHistory();
    WebSocketManager.destructor();
  });

  it('should initialize WebSocketManager', () => {
    const initWSSpy = sinon.spy(webSocketManager, 'initWSS' as any);
    webSocketManager.init(server);
    expect(initWSSpy.calledWith(server)).to.be.true;
  });

  it('should handle joinRoom event', () => {
    const socket = new MockWebSocket() as any;
    webSocketManager.init(server);
    const joinRoomCallback = webSocketManager.callbacks['joinRoom'];

    joinRoomCallback({ socket, room: 'testRoom', payload: 'data', id });

    expect(sendSuccessResponseStub.calledWith(socket, 'Socket joined room!')).to
      .be.true;
  });

  it('should handle failed leaveRoom event', () => {
    const socket = new MockWebSocket() as any;
    webSocketManager.init(server);
    const leaveRoomCallback = webSocketManager.callbacks['leaveRoom'];

    // Leave without ever joining
    leaveRoomCallback({ socket, room: 'testRoom', payload: 'data', id });

    expect(
      sendErrorResponseStub.calledWith(socket, 'Socket already is not room!'),
    ).to.be.true;
    expect(sendSuccessResponseStub.called).to.be.false;
  });

  it('should handle leaveRoom event', () => {
    const socket = new MockWebSocket() as any;
    webSocketManager.init(server);
    const joinRoomCallback = webSocketManager.callbacks['joinRoom'];
    const leaveRoomCallback = webSocketManager.callbacks['leaveRoom'];

    // Join then leave
    joinRoomCallback({ socket, room: 'testRoom', payload: 'data', id });
    leaveRoomCallback({ socket, room: 'testRoom', payload: 'data', id });

    expect(sendSuccessResponseStub.calledWith(socket, 'Socket left room!')).to
      .be.true;
    expect(sendErrorResponseStub.called).to.be.false;
  });

  it('should handle broadcast to room', () => {
    const socketsA = [] as MockWebSocket[];
    const socketsB = [] as MockWebSocket[];

    webSocketManager.init(server);
    const handleMsgSpy = sinon.spy(webSocketManager, 'handleMsg' as any);
    const joinRoomCallback = webSocketManager.callbacks['joinRoom'];
    const leaveRoomCallback = webSocketManager.callbacks['leaveRoom'];

    // The first three socket will be in room A, the next two are in room B
    for (let i = 0; i < 5; i++) {
      const socket = new MockWebSocket() as any;
      const sockets = i < 3 ? socketsA : socketsB;
      sockets.push(socket);
      joinRoomCallback({
        socket,
        room: i < 3 ? 'A' : 'B',
        payload: 'data',
        id: i.toString(),
      });
    }

    const msg = {
      topic: 'someTopic',
      payload: 'data',
      room: 'A',
    };
    //@ts-ignore
    webSocketManager.handleMsg(socketsA[0], rawData(msg));

    // Everyone in A except the first should have got a message
    socketsA.forEach((socket, idx) => {
      expect(socket.getData().length).equal(idx === 0 ? 0 : 1);
      if (socket.getData().length) {
        // Should not have room
        expect(JSON.parse(socket.getData()[0])).to.deep.equal({
          payload: msg.payload,
          topic: msg.topic,
        });
      }
    });
    socketsB.forEach((socket) => {
      expect(socket.getData().length).equal(0);
    });
    expect(handleMsgSpy.calledOnce).to.be.true;

    // Now send another message, but from the second socket in A
    //@ts-ignore
    webSocketManager.handleMsg(socketsA[1], rawData(msg));
    // So now the first two guys have 1, the third has 2.
    socketsA.forEach((socket, idx) => {
      expect(socket.getData().length).equal(idx === 2 ? 2 : 1);
    });
    socketsB.forEach((socket) => {
      expect(socket.getData().length).equal(0);
    });

    // Repeat but remove the third socket
    leaveRoomCallback({
      socket: socketsA[2] as any,
      room: 'A',
      payload: 'data',
      id: '2',
    });
    //@ts-ignore
    webSocketManager.handleMsg(socketsA[0], rawData(msg));
    // So now the first guy has 1 (he sent), second has 2, third should stay at 2.
    socketsA.forEach((socket, idx) => {
      expect(socket.getData().length).equal(idx === 0 ? 1 : 2);
    });

    // And do the same for sockets in B
    const msg2 = {
      topic: 'someTopic',
      payload: 'data',
      room: 'B',
      id: '0',
    };
    //@ts-ignore
    webSocketManager.handleMsg(socketsB[0], rawData(msg2));
    // So now the first two guys have 1, the third has 2.
    socketsB.forEach((socket, idx) => {
      expect(socket.getData().length).equal(idx === 0 ? 0 : 1);
    });
    socketsA.forEach((socket, idx) => {
      expect(socket.getData().length).equal(idx === 0 ? 1 : 2);
    });
  });

  it('should ignore non-join messages without room', () => {
    const socket = new MockWebSocket() as any;
    const socketA = new MockWebSocket() as any;

    webSocketManager.init(server);

    const joinRoomCallback = webSocketManager.callbacks['joinRoom'];
    joinRoomCallback({ socket: socketA, room: 'A', payload: 'data', id });

    const msg = { topic: 'someTopic', payload: 'somePayload' };

    // Sending a non-join message without room
    //@ts-ignore
    webSocketManager.handleMsg(socket, rawData(msg));
    // Ensure the appropriate error message is sent to the socket
    expect(
      sendErrorResponseStub.calledWith(
        socket,
        'Received non-join message without room, ignoring!',
      ),
    ).to.be.true;
    // Ensure no message is sent to other sockets
    expect(socket.getData().length).to.equal(0);
    expect(socketA.getData().length).to.equal(0);
  });
});
