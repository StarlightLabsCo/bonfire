// Util functions
function base64ToUint8Array(base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function uint8ArrayToFloat32Array(u8a: Uint8Array) {
  const numSamples = u8a.length / 2; // because 16-bit samples
  const f32Array = new Float32Array(numSamples);
  let ptr = 0;

  for (let i = 0; i < numSamples; i++) {
    // Convert 2 bytes to a 16-bit signed integer
    const sample = (u8a[ptr + 1] << 8) | u8a[ptr];
    ptr += 2;

    // Normalize to [-1, 1]
    f32Array[i] =
      sample < 0x8000 ? sample / 0x8000 : (sample - 0x10000) / 0x8000;
  }

  return f32Array;
}

// Audio module setup
function setupBufferedPlayerProcessor() {
  const processorCode = `
          // Incorporate RingBuffer inside the AudioWorkletProcessor
          class RingBuffer {
            constructor(length) {
              this.buffer = new Float32Array(length);
              this.writePointer = 0;
              this.readPointer = 0;
              this.availableData = 0;
            }

            push(data) {
              for (let i = 0; i < data.length; i++) {
                let sample = data[i];
                if (this.availableData >= this.buffer.length) return; // Buffer full
                this.buffer[this.writePointer] = sample;
                this.writePointer = (this.writePointer + 1) % this.buffer.length;
                this.availableData++;
              }
            }

            pull(amount) {
              let output = new Float32Array(amount);
              for (let i = 0; i < amount; i++) {
                if (this.availableData <= 0) {
                  output.set(new Float32Array(amount - i), i); // Fill the rest with zeros
                  break;
                }
                output[i] = this.buffer[this.readPointer];
                this.readPointer = (this.readPointer + 1) % this.buffer.length;
                this.availableData--;
              }
              return output;
            }

            clear() {
              this.writePointer = 0;
              this.readPointer = 0;
              this.availableData = 0;
            }
          }

          class BufferedPlayerProcessor extends AudioWorkletProcessor {
              constructor() {
                  super();
                  this.ringBuffer = new RingBuffer(44100 * 60); // 60 seconds buffer, adjust as needed
                  this.port.onmessage = event => {
                      if (event.data.push) {
                          this.ringBuffer.push(event.data.push);
                      } else if (event.data.clear) {
                        this.clearBuffer();
                      }
                  };
              }

              process(inputs, outputs) {
                  const output = outputs[0];
                  const outputChannel = output[0];
                  outputChannel.set(this.ringBuffer.pull(outputChannel.length));
                  return true;
              }

              clearBuffer() {
                this.ringBuffer.clear();
              }
          }

          registerProcessor('buffered-player-processor', BufferedPlayerProcessor);
          `;

  const blob = new Blob([processorCode], {
    type: 'application/javascript',
  });
  const blobURL = URL.createObjectURL(blob);

  return blobURL;
}

function clearBufferedPlayerNodeBuffer(
  bufferedPlayerNode: AudioWorkletNode | null,
) {
  if (bufferedPlayerNode === null) {
    console.log('bufferedPlayerNode is null');
    return;
  }

  bufferedPlayerNode.port.postMessage({ clear: true });
}

function bufferBase64Audio(
  audioContext: AudioContext | null,
  bufferedPlayerNode: AudioWorkletNode | null,
  audioBase64: string,
) {
  if (audioContext === null) {
    console.log('audioContext is null');
    return;
  }

  if (bufferedPlayerNode === null) {
    console.log('bufferedPlayerNode is null');
    return;
  }

  audioContext?.resume();

  const audioBytes = base64ToUint8Array(audioBase64);
  const audioFloat32Array = uint8ArrayToFloat32Array(audioBytes);

  bufferedPlayerNode.port.postMessage({ push: audioFloat32Array });
}

// Audio recorder - recording audio from microphone, streamed to server
function setupAudioInputProcessor() {
  const processorCode = `
          class AudioInputProcessor extends AudioWorkletProcessor {
            constructor() {
                  super();
                  this.port.onmessage = event => {
                      if (event.data.recording !== undefined) {
                          console.log('Setting recording to', event.data.recording);
                          this.recording = event.data.recording;
                      }
                  };
              }

            process(inputs, outputs) {
              if (!this.recording) {
                return true;
              }

              const input = inputs[0];
              const leftChannel = input[0]

              const pcmOutput = new Int16Array(leftChannel.length);
              for (let i = 0; i < leftChannel.length; i++) {
                pcmOutput[i] = Math.max(-1, Math.min(1, leftChannel[i])) * 0x7FFF;
              }

              this.port.postMessage(pcmOutput);

              return true;
            }
          }

          registerProcessor('audio-input-processor', AudioInputProcessor);
          `;

  const blob = new Blob([processorCode], {
    type: 'application/javascript',
  });
  const blobURL = URL.createObjectURL(blob);

  return blobURL;
}

class AudioRecorder {
  private audioContext: AudioContext;

  private mediaStream: MediaStream | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;

  private analyser: AnalyserNode | null = null;

  private audioInputProcessorNode: AudioWorkletNode | null = null;
  private audioBuffer = new Int16Array(0);

  private initialized = false;

  public recording = false;
  public onmessage: (event: MessageEvent) => void = () => {};

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async init(): Promise<void> {
    // Create AudioInput Node
    try {
      console.log('Requesting microphone access...');

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      return;
    }

    this.mediaStreamSource = this.audioContext.createMediaStreamSource(
      this.mediaStream,
    );

    // Create input visualizer node
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 32;

    this.mediaStreamSource.connect(this.analyser);

    // Create stream processor node (that accumulates and sends data to server)
    const blobURL = setupAudioInputProcessor();
    await this.audioContext.audioWorklet.addModule(blobURL);

    this.audioInputProcessorNode = new AudioWorkletNode(
      this.audioContext,
      'audio-input-processor',
    );

    this.audioInputProcessorNode.port.onmessage = (event) => {
      const incomingData = event.data;

      const newBuffer = new Int16Array(
        this.audioBuffer.length + incomingData.length,
      );
      newBuffer.set(this.audioBuffer);
      newBuffer.set(incomingData, this.audioBuffer.length);

      this.audioBuffer = newBuffer;

      if (this.audioBuffer.length >= 44100 / 10) {
        const event = new MessageEvent('data', { data: this.audioBuffer });
        this.onmessage(event);
        this.audioBuffer = new Int16Array(0);
      }
    };

    this.audioContext.resume();
    this.analyser.connect(this.audioInputProcessorNode);
  }

  getFrequencyData() {
    if (this.analyser === null) return new Uint8Array(0);

    let dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Group the bins into 4 logarithmically spaced groups and average each group
    let averagedData = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      const start = Math.floor(dataArray.length * (Math.pow(2, i - 1) / 15));
      const end = Math.floor(dataArray.length * (Math.pow(2, i) / 15));
      const bins = dataArray.slice(start, end);
      const average = bins.reduce((a, b) => a + b) / bins.length;
      averagedData[i] = average;
    }

    return averagedData;
  }

  async startRecording() {
    if (this.recording) return;

    if (this.initialized === false) {
      await this.init();
      this.initialized = true;
    }

    this.recording = true;
    this.audioInputProcessorNode?.port.postMessage({ recording: true });
  }

  stopRecording() {
    if (!this.recording) return;

    this.recording = false;
    this.audioInputProcessorNode?.port.postMessage({ recording: false });

    this.onmessage(new MessageEvent('end'));
  }
}

// Main setup function
async function setupAudio() {
  const audioContext = new AudioContext({
    sampleRate: 44100,
    latencyHint: 'interactive',
  });

  // Setup AudioWorklet for buffered streaming playback
  const blobURL = setupBufferedPlayerProcessor();
  await audioContext.audioWorklet.addModule(blobURL);

  const bufferedPlayerNode = new AudioWorkletNode(
    audioContext,
    'buffered-player-processor',
  );

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

export {
  base64ToUint8Array,
  arrayBufferToBase64,
  uint8ArrayToFloat32Array,
  setupAudio,
  bufferBase64Audio,
  clearBufferedPlayerNodeBuffer,
  AudioRecorder,
};
