export const startScreenShare = async (
  setScreenStream: (stream: MediaStream) => void,
  onRecoderStop: () => void,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const controller = new CaptureController();
    controller.setFocusBehavior('no-focus-change');
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      controller,
    });

    setScreenStream(stream);
    // Initialize MediaRecorder to capture the screen stream
    const recorder = new MediaRecorder(stream);

    recorder.onstop = () => {
      // Clean up resources when recording stops
      if (stream) {
        const tracks = stream.getTracks();
        // TODO: Remove from stream
        tracks.forEach((track) => track.stop());
      }
      onRecoderStop();
    };

    recorder.start();

    return { stream, recorder };
  } catch (error) {
    console.error('Error starting screen share:', error);
    return {};
  }
};
