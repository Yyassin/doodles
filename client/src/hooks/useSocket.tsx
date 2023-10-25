import WebsocketClient from '@/WebsocketClient';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { useEffect, useRef } from 'react';

/**
 * Defines a hook that controls all socket related activities
 * @author Abdalla Abdelhadi
 */

export const useSocket = () => {
  const {
    roomID,
    counter: action,
    setCounter: setAction,
  } = useWebSocketStore(['roomID', 'counter', 'setCounter']);

  const socket = useRef<WebsocketClient>();

  //setup callBack object based on actions
  const callBacks = { log: (payload: number) => console.log(payload) };

  //intialize socket
  useEffect(() => {
    socket.current = new WebsocketClient(callBacks);
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  //The socket joins room or leaves once the roomID changes
  useEffect(() => {
    if (roomID === null) {
      if (socket.current?.room !== null) {
        socket.current?.leaveRoom();
      }
    } else {
      socket.current?.joinRoom(roomID);
    }
  }, [roomID]);

  //Send message once action gets set. Note: will be changed
  useEffect(() => {
    if (!action) return;
    socket.current?.sendMsgRoom(action);
  }, [action]);
};
