import { base64ToUint8Array, uint8ArrayToFloat32Array } from './util';

export function setupBufferedPlayerProcessor() {
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
              this.buffer = new Float32Array(this.buffer.length);
            }
          }

          class BufferedPlayerProcessor extends AudioWorkletProcessor {
              constructor() {
                  super();
                  this.ringBuffer = new RingBuffer(44100 * 300); // 5 minutes of audio
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

export function clearBufferedPlayerNodeBuffer(bufferedPlayerNode: AudioWorkletNode | null) {
  if (bufferedPlayerNode === null) {
    console.log('bufferedPlayerNode is null');
    return;
  }

  bufferedPlayerNode.port.postMessage({ clear: true });
}

export function bufferBase64Audio(
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

  audioContext.resume();

  const audioBytes = base64ToUint8Array(audioBase64);
  const audioFloat32Array = uint8ArrayToFloat32Array(audioBytes);

  bufferedPlayerNode.port.postMessage({ push: audioFloat32Array });
}
