import axios from 'axios';

const ICE_SERVERS = [
  { urls: 'stun:stun.stunprotocol.org' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
  { urls: 'stun:stun.l.google.com:19302' },
];

export const handleNegotiationNeededEvent = async (
  peer: RTCPeerConnection,
  path: string,
  roomID: string,
  userId: string,
  onError: (e: unknown) => void,
) => {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
    roomId: roomID,
    userId,
  };

  try {
    const { data } = await axios.post(
      `http://localhost:3005/sfu/${path}`,
      payload,
    );
    const desc = new RTCSessionDescription(data.sdp);
    await peer.setRemoteDescription(desc).catch((e) => {
      throw e;
    });
  } catch (e) {
    onError(e);
  }
};

export const createPeer = (
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onNegotiationNeeded: (peer: RTCPeerConnection) => void,
) => {
  const peer = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });
  peer.onicecandidate = ({ candidate }) => {
    if (candidate && candidate.candidate && candidate.candidate.length > 0) {
      onIceCandidate(candidate);
    }
  };
  peer.onnegotiationneeded = () => onNegotiationNeeded(peer);
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
