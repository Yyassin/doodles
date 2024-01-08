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
const pollOngoingStream = async (roomID: string, initConsumer: () => void) => {
  try {
    const { data } = await axios.put(REST.sfu.poll, {
      roomId: roomID,
    });
    data.roomHasProducer && initConsumer();
  } catch (e) {
    console.error('Failed to poll for ongoing stream');
  }
};

export const sfu = { poll: pollOngoingStream };
