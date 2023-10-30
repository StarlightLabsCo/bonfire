// Documentation: https://docs.elevenlabs.io/api-reference/text-to-speech-websockets
import { AudioCreatedResponse, StarlightWebSocketResponseType } from 'websocket/types';
import { sendToUser } from '../src/connection';

if (!process.env.ELEVEN_LABS_API_KEY) {
  throw new Error('ELEVEN_LABS_API_KEY is not defined');
}

const connectionIdToElevenLabsWs: { [key: string]: WebSocket } = {};

export function initSpeechStreamConnection(connectionId: string, narratorId: string = '1Tbay5PQasIwgSzUscmj') {
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

      connectionIdToElevenLabsWs[connectionId] = ws;
      resolve(ws);
    });

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data.toString());

      if (data.audio) {
        sendToUser(connectionId, {
          type: StarlightWebSocketResponseType.audioCreated,
          data: {
            audio: data.audio,
          },
        } as AudioCreatedResponse);
      }
    });

    ws.addEventListener('error', (err) => {
      delete connectionIdToElevenLabsWs[connectionId];
      console.error(`Error from 11 labs.`, err);
    });

    ws.addEventListener('close', (event) => {
      delete connectionIdToElevenLabsWs[connectionId];
      console.log(`Disconnected from 11 labs.`, event.code, event.reason);
    });
  });
}

export function appendToSpeechStream(connectionId: string, args: string) {
  const ws = connectionIdToElevenLabsWs[connectionId];
  if (!ws || ws.readyState != WebSocket.OPEN) {
    console.error(`Tried to append word to speech stream but not connected to 11 labs.`);
    return;
  }

  ws.send(JSON.stringify({ text: args }));
}

export function endSpeechStream(connectionId: string) {
  const ws = connectionIdToElevenLabsWs[connectionId];
  if (!ws || ws.readyState != WebSocket.OPEN) {
    console.error(`Tried to end speech stream but not connected to 11 labs.`);
    return;
  }

  ws.send(JSON.stringify({ text: '' }));
}
