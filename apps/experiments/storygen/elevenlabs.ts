import { uploadPcmToR2 } from './cloudflare';

if (!process.env.ELEVEN_LABS_API_KEY) {
  throw new Error('ELEVEN_LABS_API_KEY is not defined');
}

export type AudioWordTimings = {
  words: string[];
  wordStartTimesMs: number[];
  wordDurationsMs: number[];
};

let buffer: Buffer[] = [];

export function initSpeechStreamConnection(narratorId: string = '1Tbay5PQasIwgSzUscmj') {
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
        buffer.push(audioBuffer);
      }

      start = false;

      if (data.normalizedAlignment) {
        wordTimings = processNormalizedAlignment(data.normalizedAlignment, wordTimings);
      }

      if (end) {
        const completeAudioBuffer = Buffer.concat(buffer);

        const pcmPath = await uploadPcmToR2(completeAudioBuffer, Math.random().toString(36).substring(7));
        console.log(`Uploaded audio to: ${pcmPath}`);
        console.log(`Word timings: ${JSON.stringify(wordTimings)}`);
      }
    });
  });
}

export function appendToSpeechStream(ws: WebSocket, args: string) {
  if (!ws || ws.readyState != WebSocket.OPEN) {
    console.error(`Tried to append word to speech stream but not connected to 11 labs.`);
    return;
  }

  ws.send(JSON.stringify({ text: args }));
}

export function endSpeechStream(ws: WebSocket) {
  if (!ws || ws.readyState != WebSocket.OPEN) {
    console.error(`Tried to end speech stream but not connected to 11 labs.`);
    return;
  }

  ws.send(JSON.stringify({ text: '' }));
}

function processNormalizedAlignment(
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

  return wordTimings;
}
