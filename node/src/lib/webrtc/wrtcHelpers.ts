import webrtc from 'wrtc';
import { ICE_SERVERS, WS_TOPICS } from '../../constants';
import { websocketManager } from '../websocket/WebSocketManager';
import { Logger } from '../../utils/Logger';

/**
 * Contains utility functions related to WebRTC, including creating
 * RTCPeerConnection instances and handling signaling events.
 * @author Yousef Yassin
 */

/**
 * Creates a new RTCPeerConnection instance with the specified iceServers.
 * @returns RTCPeerConnection The created RTCPeerConnection instance.
 */
export const createPeer = () =>
  new webrtc.RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });

/**
 * Handles signaling events for WebRTC communication.
 * @param peer The RTCPeerConnection instance.
 * @param sdp The RTCSessionDescription for signaling.
 * @param id The ID of the peer.
 * @param roomId The ID of the room.
 * @param logger The Logger instance for logging.
 * @param onClosed Optional callback when the connection is closed.
 * @returns A promise resolving to the configured RTCPeerConnection.
 */
export const hookSignals = async (
  peer: RTCPeerConnection,
  sdp: RTCSessionDescriptionInit,
  id: string,
  roomId: string,
  logger: Logger,
  onClosed?: () => void,
) => {
  // Create an RTCSessionDescription from the provided SDP and
  // set the remote description for the peer connection
  const desc = new webrtc.RTCSessionDescription(sdp);
  await peer.setRemoteDescription(desc);

  // Set up event listener for ICE candidates gathering to send them to the peer
  peer.onicecandidate = ({ candidate }) => {
    if (candidate && candidate.candidate && candidate.candidate.length > 0) {
      // Send the ICE candidate to the peer through WebSocket
      const roomSockets = websocketManager.sockets[roomId];
      if (roomSockets === undefined) {
        logger.debug('Failed to get roomSockets.');
        return;
      }
      const socket = roomSockets[id];
      !socket && logger.debug('Failed to get ice peer socket');

      socket?.send(
        JSON.stringify({
          topic: WS_TOPICS.ICE_CANDIDATE,
          payload: { candidate },
        }),
      );
    }
  };

  // Set up event listener for connection state changes
  peer.onconnectionstatechange = () => {
    if (['connected', 'closed', 'failed'].includes(peer.connectionState)) {
      logger.debug(`[${id}] Local Peer Connection:`, peer.connectionState);
      if (
        peer.connectionState === 'closed' ||
        peer.connectionState === 'failed'
      ) {
        onClosed && onClosed();
      }
    }
  };

  // Wait for the peer to create an answer
  const answer = await peer.createAnswer();
  // Set the local description with the created answer
  await peer.setLocalDescription(answer);
  // Return the configured peer connection
  return peer;
};
