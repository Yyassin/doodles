/**
 * Defines useful helpers related to the display media API and screensharing.
 * @author Yousef Yassin
 */

import { ipcAPI } from '@/data/ipc/ipcMessages';
import { StreamSource } from '@/types';

/**
 * Function to initiate screen sharing, capturing the user's screen and creating a MediaRecorder instance.
 * @param setScreenStream Callback function to set the captured screen stream.
 * @param onRecoderStop Callback function to be executed when the MediaRecorder stops recording.
 * @returns A promise resolving to an object containing the captured screen stream and MediaRecorder instance.
 */
const startScreenShareBrowser = async (
  setScreenStream: (stream: MediaStream) => void,
  onRecoderStop: () => void,
) => {
  try {
    // Create a capture controller to prevent focus change when screen sharing.
    // Note that this API is not yet supported in all browsers; and isn't typed in TypeScript.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const controller = new CaptureController();
    controller.setFocusBehavior('no-focus-change');
    // Get the screen stream, this will prompt the user to select a screen to share.
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      controller,
    });
    setScreenStream(stream);

    // Initialize MediaRecorder to capture the screen stream
    const recorder = new MediaRecorder(stream);
    // Subscribe to the stop event to clean up resources
    recorder.onstop = () => {
      // Clean up resources when recording stops
      if (stream) {
        const tracks = stream.getTracks();
        // TODO: Remove from stream via label ref and a callback
        tracks.forEach((track) => track.stop());
      }
      onRecoderStop();
    };

    // Start the sharing.
    recorder.start();
    return { stream, recorder };
  } catch (error) {
    console.error('Error starting screen share:', error);
    return {};
  }
};

/**
 * Function to initiate screen sharing for electron. This consists of two phases. Here, we fetch
 * all the available input sources and prompt the user with a dialog with onScreenSelect. Selection
 * in this dialog will trigger the second phase by setting the sourceId in the RTCProducer hook.
 * @param onScreenSelect Callback function to open a dialog with the available input sources.
 * Note that the first two parameters are unused, they are defined to maintain signature.
 */
const startScreenShareElectron = async (
  _setScreenStream: (stream: MediaStream) => void,
  _onRecoderStop: () => void,
  onScreenSelect: (streamSources: StreamSource[]) => void,
) => {
  try {
    // Defined in electron
    const streams =
      (await navigator.mediaDevices.enumerateDevices()) as unknown as StreamSource[];
    onScreenSelect(streams);
  } catch (error) {
    console.error('Error starting screen share:', error);
    return {};
  }
};

export const startScreenShare = ipcAPI
  ? startScreenShareElectron
  : startScreenShareBrowser;
