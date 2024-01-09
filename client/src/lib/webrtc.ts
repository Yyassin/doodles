import { REST_ROOT } from '@/constants';
import axios from 'axios';

/**
 * Defines general helper methods for creating and handling
 * WebRTC peer connections.
 * @author Yousef Yassin
 */

/**
 * ICE STUN servers used for WebRTC communication.
 */
const ICE_SERVERS = [
  { urls: 'stun:stun.stunprotocol.org' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
  { urls: 'stun:stun.l.google.com:19302' },
];

/**
 * Handles the negotiation needed event for a WebRTC peer connection.
 * Creates and sends an offer, then sets the local and remote descriptions.
 * @param peer RTCPeerConnection, the WebRTC peer connection.
 * @param path String, the path for the SFU (Selective Forwarding Unit) server.
 * @param roomID String, the ID of the room.
 * @param userId String, the user ID.
 * @param onError Function, callback to handle errors.
 */
export const handleNegotiationNeededEvent = async (
  peer: RTCPeerConnection,
  path: string,
  roomID: string,
  userId: string,
  onError: (e: unknown) => void,
) => {
  // Create SDP offer
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
    roomId: roomID,
    userId,
  };

  try {
    // Send the offer to the REST signalling server and wait for the accepted answer SDP
    const { data } = await axios.post(`${REST_ROOT}/sfu/${path}`, payload);
    const desc = new RTCSessionDescription(data.sdp);
    await peer.setRemoteDescription(desc).catch((e) => {
      throw e;
    });
  } catch (e) {
    onError(e);
  }
};

/**
 * Creates a new WebRTC peer connection with specified event callbacks.
 * @param onIceCandidate Function, callback for handling gathered ICE candidates.
 * @param onNegotiationNeeded Function, callback for handling negotiation.
 * @returns RTCPeerConnection, the created WebRTC peer connection.
 */
export const createPeer = (
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onNegotiationNeeded: (peer: RTCPeerConnection) => void,
) => {
  const peer = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });
  // On ice candidate callback to send gathered candidates to the signalling server
  peer.onicecandidate = ({ candidate }) => {
    if (candidate && candidate.candidate && candidate.candidate.length > 0) {
      onIceCandidate(candidate);
    }
  };
  // On negotiation needed callback to create and send an offer
  peer.onnegotiationneeded = () => onNegotiationNeeded(peer);
  // On connection state change callback to log the connection state
  peer.onconnectionstatechange = (e) => {
    const { srcElement, target } = e as unknown as {
      srcElement: RTCPeerConnection;
      target: RTCPeerConnection;
    };
    if (
      ['connected', 'closed', 'failed'].includes(srcElement.connectionState)
    ) {
      console.log('Local Peer Connection:', srcElement.connectionState);
    }
    if (['connected', 'closed', 'failed'].includes(target.connectionState)) {
      console.log('Remote Peer Connection:', target.connectionState);
    }
  };
  // peer.onsignalingstatechange = (e) => {
  //   console.log('signalling state', e);
  // };
  // peer.onicegatheringstatechange = (e) => {
  //   console.log('ice gathering state', e);
  // };
  return peer;
};
