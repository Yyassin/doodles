/**
 * Common type definitions used across the application
 * @authors Yousef Yassin
 */

/**
 * Interface representing a Peer Connection.
 */
interface PeerConnection {
  id: string; // Unique identifier for the peer connection.
  peer: RTCPeerConnection; // RTCPeerConnection instance.
}

/**
 * Type representing a Streamer Peer.
 * Extends PeerConnection and includes a MediaStream property.
 */
export type StreamerPeer = PeerConnection & {
  stream: MediaStream | null; // MediaStream associated with the streamer peer, or null if not available.
};

/**
 * Type representing a Consumer Peer.
 * Extends PeerConnection and includes a dictionary of RTCRtpSender instances.
 */
export type ConsumerPeer = PeerConnection & {
  tracks: Record<string, RTCRtpSender>; // Dictionary of RTCRtpSender instances associated with the consumer peer.
};
