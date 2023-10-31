export function setupAudioInputProcessor() {
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

export class AudioRecorder {
  private audioContext: AudioContext;

  private mediaStream: MediaStream | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;

  private audioInputProcessorNode: AudioWorkletNode | null = null;
  private audioBuffer = new Int16Array(0);

  private initialized = false;

  public recording = false;
  public onmessage: (event: MessageEvent) => void = () => {};

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async init(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      return;
    }

    this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Create stream processor node (that accumulates and sends data to server)
    const blobURL = setupAudioInputProcessor();
    await this.audioContext.audioWorklet.addModule(blobURL);

    this.audioInputProcessorNode = new AudioWorkletNode(this.audioContext, 'audio-input-processor');

    this.audioInputProcessorNode.port.onmessage = (event) => {
      const incomingData = event.data;

      const newBuffer = new Int16Array(this.audioBuffer.length + incomingData.length);
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
    this.mediaStreamSource.connect(this.audioInputProcessorNode);
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
