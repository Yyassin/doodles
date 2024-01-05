interface PeerConnection {
  id: string;
  peer: RTCPeerConnection;
}

export type StreamerPeer = PeerConnection & {
  stream: MediaStream | null;
};
export type ConsumerPeer = PeerConnection & {
  tracks: Record<string, RTCRtpSender>;
};
