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

  bufferedPlayerNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Retrieve browser volume from local storage
  let volume = localStorage.getItem('volume') ? parseFloat(localStorage.getItem('volume') as string) : 0.75;

  gainNode.gain.value = volume;

  return {
    audioContext,
    bufferedPlayerNode,
    gainNode,
    volume,
  };
}
