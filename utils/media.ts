/**
 * Handles and logs specific media access errors to the console for debugging.
 * @param {Error} err - The error object from a media access attempt.
 */
function handleMediaError(err: Error): void {
  console.error('Media access error:', err.name, err.message);
  
  switch (err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      console.error('Permission denied. The user must grant camera and microphone access in browser settings.');
      break;
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      console.error('No suitable camera or microphone was found on this device.');
      break;
    case 'NotReadableError':
    case 'TrackStartError':
      console.error('The camera or microphone is already in use by another application or a hardware error occurred.');
      break;
    case 'OverconstrainedError':
      console.error('The specified constraints (e.g., resolution) cannot be met by the available devices.');
      break;
    case 'TypeError':
      console.error('Invalid constraints were provided to getUserMedia.');
      break;
    default:
      console.error('An unknown error occurred while accessing media devices.');
  }
}

/**
 * Get user media (camera and microphone) for the application.
 * @param {MediaStreamConstraints} constraints - Optional media constraints to override the default.
 * @returns {Promise<MediaStream>} - A promise that resolves to the media stream.
 * @throws Will throw an error if media access fails.
 */
export async function getUserMedia(constraints: MediaStreamConstraints | null = null): Promise<MediaStream> {
  const defaultConstraints: MediaStreamConstraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  };

  const mediaConstraints = constraints || defaultConstraints;

  try {
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    console.log('Media stream acquired successfully:', stream.getTracks());
    return stream;
  } catch (err) {
    handleMediaError(err as Error);
    throw err;
  }
}

/**
 * Stops all tracks in a given media stream to release the hardware.
 * @param {MediaStream | null} stream - The media stream to stop.
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log(`Stopped ${track.kind} track`);
    });
  }
}

/**
 * Enumerates available media input devices (cameras and microphones).
 * @returns {Promise<{videoDevices: MediaDeviceInfo[], audioDevices: MediaDeviceInfo[]}>} - An object containing arrays of available video and audio devices.
 */
export async function getMediaDevices(): Promise<{ videoDevices: MediaDeviceInfo[], audioDevices: MediaDeviceInfo[] }> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      videoDevices: devices.filter(d => d.kind === 'videoinput'),
      audioDevices: devices.filter(d => d.kind === 'audioinput')
    };
  } catch (err) {
    console.error('Error enumerating devices:', err);
    throw err;
  }
}

/**
 * Switches the video input to a different camera device.
 * @param {string} deviceId - The device ID of the camera to switch to.
 * @param {MediaStream | null} currentStream - The current active stream, which will be stopped.
 * @returns {Promise<MediaStream>} - A new media stream from the selected device.
 */
export async function switchCamera(deviceId: string, currentStream: MediaStream | null = null): Promise<MediaStream> {
  if (currentStream) {
    stopMediaStream(currentStream);
  }

  const constraints: MediaStreamConstraints = {
    video: {
      deviceId: { exact: deviceId },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: true // Assuming audio should also be captured
  };

  return await getUserMedia(constraints);
}
