/**
 * Unit Tests for WebSocketManager
 * Uses Sinon for stubs and Chai for assertions.
 * @author Yousef Yassin, Adbdalla Abdelhadi
 */

import * as sinon from 'sinon';
import { expect } from 'chai';
import http, {
  IncomingMessage,
  Server,
  ServerOptions,
  ServerResponse,
} from 'http';
import WebsocketHelper from '../src/lib/websocket/websocketHelpers';

// Create stubs for WebSocketHelper methods
let sendSuccessResponseStub = sinon
  .stub(WebsocketHelper, 'sendSuccessResponse' as any)
  .returns('Socket left room!');
let sendErrorResponseStub = sinon
  .stub(WebsocketHelper, 'sendErrorResponse' as any)
  .returns('Error response sent');

// Create a stub for the server.listen method
const listenStub = sinon.stub().callsArg(1);

// Create a stub for the server.close method
const closeStub = sinon.stub().callsArg(0);

// Create a fake server instance
const server: any = {
  on: sinon.stub(),
  listen: listenStub,
  close: closeStub,
};
// Create a stub for the http.createServer method
const createServerStub = sinon.stub(http, 'createServer');
// Configure the createServerStub to return the fake server
createServerStub.callsFake(
  (
    options: ServerOptions<typeof IncomingMessage, typeof ServerResponse>,
    requestListener?: http.RequestListener,
  ) => {
    if (requestListener) {
      server.on('request', requestListener);
    }
    return server as Server;
  },
);

// Import WebSocketManager for testing; AFTER stubbing, so it uses the stubs.
import WebSocketManager from '../src/lib/websocket/WebSocketManager';
import { WS_TOPICS } from '../src/constants';

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

// Test suite for WebSocketManager
describe('WebSocketManager', () => {
  const id = 'anId';
  let webSocketManager: WebSocketManager;

  beforeEach(() => {
    webSocketManager = WebSocketManager.Instance;
    // Simplifies counting for tests.
    webSocketManager.shouldNotify = false;
  });

  afterEach(() => {
    sendSuccessResponseStub.resetHistory();
    sendErrorResponseStub.resetHistory();
    WebSocketManager.destructor();
  });

  it('should initialize WebSocketManager', () => {
    const initWSSpy = sinon.spy(webSocketManager, 'initWSS' as any);
    webSocketManager.init(server);
    // Assert that the initWSS method is called with the server parameter
    expect(initWSSpy.calledWith(server)).to.be.true;
  });

  it('should handle joinRoom event', () => {
    const socket = new MockWebSocket() as any;
    webSocketManager.init(server);
    const joinRoomCallback = webSocketManager.callbacks[WS_TOPICS.JOIN_ROOM];
    // Simulate a joinRoom event and check if it sends a success response
    joinRoomCallback({ socket, room: 'testRoom', payload: 'data', id });
    expect(sendSuccessResponseStub.calledWith(socket, 'Socket joined room!')).to
      .be.true;
  });

  it('should handle failed leaveRoom event', () => {
    const socket = new MockWebSocket() as any;
    webSocketManager.init(server);
    const leaveRoomCallback = webSocketManager.callbacks[WS_TOPICS.LEAVE_ROOM];

    // Simulate a leaveRoom event without joining and check for an error response
    leaveRoomCallback({ socket, room: 'testRoom', payload: 'data', id });
    expect(
      sendErrorResponseStub.calledWith(socket, 'Socket already is not room!'),
    ).to.be.true;
    // Ensure success response is not called
    expect(sendSuccessResponseStub.called).to.be.false;
  });

  it('should handle leaveRoom event', () => {
    const socket = new MockWebSocket() as any;
    webSocketManager.init(server);
    const joinRoomCallback = webSocketManager.callbacks[WS_TOPICS.JOIN_ROOM];
    const leaveRoomCallback = webSocketManager.callbacks[WS_TOPICS.LEAVE_ROOM];

    // Simulate a joinRoom and leaveRoom event and check for a success response
    joinRoomCallback({ socket, room: 'testRoom', payload: 'data', id });
    leaveRoomCallback({ socket, room: 'testRoom', payload: 'data', id });
    expect(sendSuccessResponseStub.calledWith(socket, 'Socket left room!')).to
      .be.true;
    // Ensure error response is not called
    expect(sendErrorResponseStub.called).to.be.false;
  });

  it('should handle broadcast to room', () => {
    const socketsA = [] as MockWebSocket[];
    const socketsB = [] as MockWebSocket[];

    webSocketManager.init(server);
    const handleMsgSpy = sinon.spy(webSocketManager, 'handleMsg' as any);
    const joinRoomCallback = webSocketManager.callbacks[WS_TOPICS.JOIN_ROOM];
    const leaveRoomCallback = webSocketManager.callbacks[WS_TOPICS.LEAVE_ROOM];

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

    // Check if each socket in room A receives the message except the sender
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
    // Check if sockets in room B do not receive the message
    socketsB.forEach((socket) => {
      expect(socket.getData().length).equal(0);
    });
    // Ensure handleMsg was called once only
    expect(handleMsgSpy.calledOnce).to.be.true;

    // Repeat similar logic for subsequent messages and socket removal
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

    const joinRoomCallback = webSocketManager.callbacks[WS_TOPICS.JOIN_ROOM];
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
