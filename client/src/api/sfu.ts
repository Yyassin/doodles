import { REST } from '@/constants';
import axios from 'axios';

/**
 * Defines REST methods for the SFU API.
 * @author Yousef Yassin
 */

/**
 * Function to poll for an ongoing stream in a room and initialize a consumer if available.
 * @param roomID String, the ID of the room to poll.
 * @param initConsumer Function, callback to initialize the consumer when a stream is available.
 */
const pollOngoingStream = async (
  roomID: string,
  initConsumer: (id: string) => void,
) => {
  try {
    const { data } = await axios.put(REST.sfu.poll, {
      roomId: roomID,
    });
    // Initialize the consumer, and pass the producer ID to set the active producer id for
    // styling purposes.
    data.producerId && initConsumer(data.producerId);
  } catch (e) {
    console.error('Failed to poll for ongoing stream');
  }
};

export const sfu = { poll: pollOngoingStream };
