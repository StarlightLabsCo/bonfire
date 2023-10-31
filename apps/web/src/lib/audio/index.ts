import { setupBufferedPlayerProcessor } from './playback';

export async function setupAudio() {
  const audioContext = new AudioContext({
    sampleRate: 44100,
    latencyHint: 'interactive',
  });

  // Setup AudioWorklet for buffered streaming playback
  const blobURL = setupBufferedPlayerProcessor();
  await audioContext.audioWorklet.addModule(blobURL);

  const bufferedPlayerNode = new AudioWorkletNode(audioContext, 'buffered-player-processor');

  // Gain node for volume control / mute
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1;

  bufferedPlayerNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  return {
    audioContext,
    bufferedPlayerNode,
    gainNode,
  };
}
