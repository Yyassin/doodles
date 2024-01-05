import webrtc from 'wrtc';
import { ICE_SERVERS } from '../../constants';
import { websocketManager } from '../websocket/WebSocketManager';
import { Logger } from '../../utils/Logger';

export const createPeer = () =>
  new webrtc.RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });

export const hookSignals = async (
  peer: RTCPeerConnection,
  sdp: RTCSessionDescriptionInit,
  id: string,
  roomId: string,
  logger: Logger,
) => {
  const desc = new webrtc.RTCSessionDescription(sdp);
  await peer.setRemoteDescription(desc);

  // Set remote desc first
  peer.onicecandidate = ({ candidate }) => {
    if (candidate && candidate.candidate && candidate.candidate.length > 0) {
      // Send the candidate to the peer
      const roomSockets = websocketManager.sockets[roomId];
      if (roomSockets === undefined) {
        logger.debug('Failed to get roomSockets.');
        return;
      }
      const socket = roomSockets[id];
      !socket && logger.debug('Failed to get ice peer socket');

      socket?.send(
        JSON.stringify({
          topic: 'new-ice-candidate',
          payload: { candidate },
        }),
      );
    }
  };

  peer.onconnectionstatechange = () => {
    if (['connected', 'closed', 'failed'].includes(peer.connectionState)) {
      logger.debug(`[${id}] Local Peer Connection:`, peer.connectionState);
    }
  };

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  return peer;
};
