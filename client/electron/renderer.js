/**
 * @file Overriding mediaDevices APIs to integrate with Electron IPC for screen sharing.
 * @author Yousef Yassin
 */

// Override enumerateDevices to use IPC to fetch screen sources
navigator.mediaDevices.enumerateDevices = async () =>
  globalThis.ipcAPI.getSources();

/**
 * Override getDisplayMedia to create a MediaStream with specified screen source.
 * @param sourceId The ID of the screen source to capture.
 * @returns A promise resolving to the MediaStream with the specified screen source.
 */
navigator.mediaDevices.getDisplayMedia = async (sourceId) => {
  // Create MediaStream with screen source
  return await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        minWidth: 1280,
        maxWidth: 4096,
        minHeight: 720,
        maxHeight: 4096,
      },
    },
  });
};
