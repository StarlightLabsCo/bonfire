// Documentation: https://docs.elevenlabs.io/api-reference/text-to-speech-websockets
import { AudioCreatedResponse, AudioWordTimings, StarlightWebSocketResponseType } from 'websocket/types';
import { sendToInstanceSubscribers } from '../src/connection';
import { uploadPcmToR2 } from './cloudflare'; // Import the upload function
import { db } from './db';

if (!process.env.ELEVEN_LABS_API_KEY) {
  throw new Error('ELEVEN_LABS_API_KEY is not defined');
}

const instanceIdToElevenLabsWs: { [key: string]: WebSocket } = {};
const instanceIdToAudioBuffer: { [key: string]: Buffer[] } = {};

export function initSpeechStreamConnection(instanceId: string, messageId: string, narratorId: string = '1Tbay5PQasIwgSzUscmj') {
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

    let wordTimings: AudioWordTimings;
    let start = true;
    let end = false;

    ws.addEventListener('message', async (event: MessageEvent) => {
      const data = JSON.parse(event.data.toString());

      if (data.isFinal) end = true;

      if (data.audio) {
        const audioBuffer = Buffer.from(data.audio, 'base64');
        if (!instanceIdToAudioBuffer[instanceId]) {
          instanceIdToAudioBuffer[instanceId] = [audioBuffer];
        } else {
          instanceIdToAudioBuffer[instanceId].push(audioBuffer);
        }
      }

      sendToInstanceSubscribers(instanceId, {
        type: StarlightWebSocketResponseType.audioCreated,
        data: {
          audio: data.audio,
          start,
          end,
        },
      } as AudioCreatedResponse);

      start = false;

      if (data.normalizedAlignment) {
        wordTimings = processNormalizedAlignment(instanceId, data.normalizedAlignment, wordTimings);
      }

      if (end) {
        const completeAudioBuffer = Buffer.concat(instanceIdToAudioBuffer[instanceId]);
        delete instanceIdToAudioBuffer[instanceId];

        await uploadPcmToR2(completeAudioBuffer, messageId);

        await db.message.update({
          where: {
            id: messageId,
          },
          data: {
            audioWordTimings: JSON.stringify(wordTimings),
          },
        });
      }
    });

    ws.addEventListener('error', (err) => {
      delete instanceIdToElevenLabsWs[instanceId];
      console.error(`Error from 11 labs.`, err);
    });

    ws.addEventListener('close', (event: CloseEvent) => {
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

function processNormalizedAlignment(
  instanceId: string,
  normalizedAlignment: {
    chars: string[];
    charStartTimesMs: number[];
    charDurationsMs: number[];
  },
  previousWordTimings: AudioWordTimings,
) {
  let wordTimings: AudioWordTimings;

  // Loop through chars and group the timings by word
  let wordIndex = 0;
  let wordStartTime = normalizedAlignment.charStartTimesMs[0];
  let wordDuration = 0;

  let words: string[] = [];
  let wordStartTimesMs: number[] = [];
  let wordDurationsMs: number[] = [];

  normalizedAlignment.chars.forEach((char: string, i: number) => {
    wordDuration += normalizedAlignment.charDurationsMs[i];

    if ([' ', ',', '.', undefined].includes(char)) {
      let word = normalizedAlignment.chars.slice(wordIndex, i).join('');
      if (word !== '') {
        words.push(word);
        wordStartTimesMs.push(wordStartTime);
        wordDurationsMs.push(wordDuration);
      }

      wordIndex = i + 1;

      if (i + 1 < normalizedAlignment.charStartTimesMs.length) {
        wordStartTime = normalizedAlignment.charStartTimesMs[i + 1];
      }

      wordDuration = 0;
    }
  });

  // Save or append to word timings (adjusted for previous word timings)
  if (!previousWordTimings) {
    wordTimings = {
      words: words,
      wordStartTimesMs: wordStartTimesMs,
      wordDurationsMs: wordDurationsMs,
    };
  } else {
    let previousLastWordStartTimeMs = previousWordTimings.wordStartTimesMs[previousWordTimings.wordStartTimesMs.length - 1];
    let previousWordDurationMs = previousWordTimings.wordDurationsMs[previousWordTimings.wordDurationsMs.length - 1];

    let offset = previousLastWordStartTimeMs + previousWordDurationMs;

    wordStartTimesMs = wordStartTimesMs.map((time) => time + offset);

    wordTimings = {
      words: [...previousWordTimings.words, ...words],
      wordStartTimesMs: [...previousWordTimings.wordStartTimesMs, ...wordStartTimesMs],
      wordDurationsMs: [...previousWordTimings.wordDurationsMs, ...wordDurationsMs],
    };
  }

  sendToInstanceSubscribers(instanceId, {
    type: StarlightWebSocketResponseType.audioTimingsCreated,
    data: {
      timings: wordTimings,
    },
  });

  return wordTimings;
}
