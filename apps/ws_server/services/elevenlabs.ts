// Documentation: https://docs.elevenlabs.io/api-reference/text-to-speech-websockets
import { AudioCreatedResponse, AudioTimings, StarlightWebSocketResponseType } from 'websocket/types';
import { sendToInstanceSubscribers } from '../src/connection';

if (!process.env.ELEVEN_LABS_API_KEY) {
  throw new Error('ELEVEN_LABS_API_KEY is not defined');
}

const instanceIdToElevenLabsWs: { [key: string]: WebSocket } = {};

export function initSpeechStreamConnection(instanceId: string, narratorId: string = '1Tbay5PQasIwgSzUscmj') {
  return new Promise<WebSocket>((resolve) => {
    let ws = new WebSocket(
      `wss://api.elevenlabs.io/v1/text-to-speech/${narratorId}/stream-input?model_id=eleven_monolingual_v1&output_format=pcm_44100`,
    );

    ws.addEventListener('open', () => {
      ws.send(
        JSON.stringify({
          text: ' ',
          voice_settings: {
            stability: 0.8,
            similarity_boost: true,
          },
          xi_api_key: process.env.ELEVEN_LABS_API_KEY,
        }),
      );

      instanceIdToElevenLabsWs[instanceId] = ws;
      resolve(ws);
    });

    let wordTimings: AudioTimings;
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data.toString());

      if (data.audio) {
        sendToInstanceSubscribers(instanceId, {
          type: StarlightWebSocketResponseType.audioCreated,
          data: {
            audio: data.audio,
          },
        } as AudioCreatedResponse);
      }

      // *** TESTING ***
      if (data.normalizedAlignment) {
        let normalizedAlignment = data.normalizedAlignment;

        // Split the words
        let words = normalizedAlignment.chars.join('').split(/[\s,.]+/);
        let wordStartTimesMs: number[] = [];
        let wordDurationsMs: number[] = [];

        // Loop through chars and group the timings by word
        let wordIndex = 0;
        let wordStartTime = normalizedAlignment.charStartTimesMs[0];
        let wordDuration = 0;
        normalizedAlignment.chars.forEach((char: string, i: number) => {
          wordDuration += normalizedAlignment.charDurationsMs[i];

          if ([' ', ',', '.', undefined].includes(char)) {
            wordStartTimesMs[wordIndex] = wordStartTime;
            wordDurationsMs[wordIndex] = wordDuration;

            wordIndex++;
            wordStartTime = normalizedAlignment.charStartTimesMs[i + 1];
            wordDuration = 0;
          }
        });

        // Save or append to word timings (adjusted for previous word timings)
        if (!wordTimings) {
          wordTimings = {
            words: words,
            wordStartTimesMs: wordStartTimesMs,
            wordDurationsMs: wordDurationsMs,
          };
        } else {
          let previousLastWordStartTimeMs = wordTimings.wordStartTimesMs[wordTimings.wordStartTimesMs.length - 1];
          let previousWordDurationMs = wordTimings.wordDurationsMs[wordTimings.wordDurationsMs.length - 1];

          let offset = previousLastWordStartTimeMs + previousWordDurationMs;

          wordStartTimesMs = wordStartTimesMs.map((time) => time + offset);

          wordTimings = {
            words: [...wordTimings.words, ...words],
            wordStartTimesMs: [...wordTimings.wordStartTimesMs, ...wordStartTimesMs],
            wordDurationsMs: [...wordTimings.wordDurationsMs, ...wordDurationsMs],
          };
        }

        sendToInstanceSubscribers(instanceId, {
          type: StarlightWebSocketResponseType.audioTimingsCreated,
          data: {
            timings: wordTimings,
          },
        });
      }
    });

    ws.addEventListener('error', (err) => {
      delete instanceIdToElevenLabsWs[instanceId];
      console.error(`Error from 11 labs.`, err);
    });

    ws.addEventListener('close', (event) => {
      delete instanceIdToElevenLabsWs[instanceId];
      console.log(`Disconnected from 11 labs.`, event.code, event.reason);
    });
  });
}

export function appendToSpeechStream(instanceId: string, args: string) {
  const ws = instanceIdToElevenLabsWs[instanceId];
  if (!ws || ws.readyState != WebSocket.OPEN) {
    console.error(`Tried to append word to speech stream but not connected to 11 labs.`);
    return;
  }

  ws.send(JSON.stringify({ text: args }));
}

export function endSpeechStream(instanceId: string) {
  const ws = instanceIdToElevenLabsWs[instanceId];
  if (!ws || ws.readyState != WebSocket.OPEN) {
    console.error(`Tried to end speech stream but not connected to 11 labs.`);
    return;
  }

  ws.send(JSON.stringify({ text: '' }));
}
