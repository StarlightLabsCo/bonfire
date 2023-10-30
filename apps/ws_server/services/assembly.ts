// Documentation: https://www.assemblyai.com/docs/guides/real-time-streaming-transcription

import { StarlightWebSocketResponseType, VoiceTranscriptionProcessedResponse } from 'websocket/types';
import { sendToUser } from '../src/connection';

const SAMPLE_RATE = 44100;
const connectionIdToAssemblyWebsockets: { [key: string]: WebSocket } = {};

// ** --------------------------------- Types --------------------------------- **
// ** Request **
type AssemblyAIWebsocketRequest = AudioData | TerminateSession;

type AudioData = {
  audio_data: string; // base64 encoded audio
};

type TerminateSession = {
  terminate_session: true;
};

// ** Response **
type AssemblyAIWebsocketResponse = SessionBegins | PartialTranscript | FinalTranscript | SessionTerminated;

type SessionBegins = {
  message_type: 'SessionBegins';
  session_id: string;
  expires_at: string;
};

type Word = {
  start: number; // ms
  end: number; // ms
  conf: number;
  text: string;
};

type PartialTranscript = {
  message_type: 'PartialTranscript';
  audio_start: number; // Start time of audio sample relative to session start, in milliseconds.
  audio_end: number; // End time of audio sample relative to session start, in milliseconds.
  confidence: number; // The confidence score of the entire transcription, between 0 and 1.
  text: string;
  words: Word[];
  created: string;
};

type FinalTranscript = {
  message_type: 'FinalTranscript';
  audio_start: number;
  audio_end: number;
  confidence: number;
  text: string;
  words: Word[];
  created: string;
  punctuated: boolean; // Whether the text has been punctuated and cased.
  text_formatted: boolean; // Whether the text has been formatted (e.g. Dollar -> $)
};

type SessionTerminated = {
  message_type: 'SessionTerminated';
};

// ** Error Codes **
const assemblyErrors: { [key: number]: string } = {
  4000: 'Sample rate must be a positive integer',
  4001: 'Not Authorized',
  4002: 'Insufficient Funds or This feature is paid-only and requires you to add a credit card. Please visit https://app.assemblyai.com/ to add a credit card to your account',
  4004: 'Session not found',
  4008: 'Session Expired',
  4010: 'Session previously closed',
  4029: 'Client sent audio too fast',
  4030: 'Session is handled by another WebSocket',
  4031: 'Session idle for too long',
  4032: 'Audio duration is too short',
  4033: 'Audio duration is too long',
  4100: 'Endpoint received invalid JSON',
  4101: 'Endpoint received a message with an invalid schema',
  4102: 'This account has exceeded the number of allowed streams',
  4103: 'This session has been reconnected. This WebSocket is no longer valid.',
  1013: "Temporary server condition forced blocking client's request",
};

// ** --------------------------------- Code --------------------------------- **
async function initAssemblyWs(connectionId: string) {
  return await new Promise<WebSocket>((resolve) => {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not defined');
    }

    const ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${SAMPLE_RATE}`, {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    });

    ws.addEventListener('open', () => {
      connectionIdToAssemblyWebsockets[connectionId] = ws;
      resolve(ws);
    });

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data as string);

      // TODO: validate message

      if (data.text) {
        sendToUser(connectionId, {
          type: StarlightWebSocketResponseType.voiceTranscriptionProcessed,
          data: {
            transcription: data.text,
          },
        } as VoiceTranscriptionProcessedResponse);
      }

      // TODO: I think the terminate session here might be what's causing bad experience when you stop talking for a while.
      if (data.message_type === 'FinalMessage') {
        ws.send(JSON.stringify({ terminate_session: true } as TerminateSession));
      } else if (data.message_type === 'SessionTerminated') {
        ws.close();
        delete connectionIdToAssemblyWebsockets[connectionId];
      }
    });

    ws.addEventListener('error', (err) => {
      delete connectionIdToAssemblyWebsockets[connectionId];
      console.error(`Error from AssemblyAI.`, err);
    });

    ws.addEventListener('close', (event) => {
      console.log(`Disconnected from AssemblyAI.`);
      delete connectionIdToAssemblyWebsockets[connectionId];

      if (event.code in assemblyErrors) {
        console.error(`Error from AssemblyAI: ${assemblyErrors[event.code]}`);
      }
    });
  });
}

async function transcribeAudio(connectionId: string, base64Audio: string) {
  let ws = connectionIdToAssemblyWebsockets[connectionId];
  if (!ws) {
    console.log(`Initializing AssemblyAI websocket.`);
    ws = await initAssemblyWs(connectionId);
  }

  try {
    console.log(`Sending data to AssemblyAI.`);
    ws.send(JSON.stringify({ audio_data: base64Audio } as AudioData));
  } catch (e) {
    console.error(`Error sending data to AssemblyAI.`, e);
  }
}

async function finishTranscription(connectionId: string) {
  const assemblyWs = connectionIdToAssemblyWebsockets[connectionId];

  if (assemblyWs) {
    const base64Buffer = Buffer.alloc(44100 * 2).toString('base64');
    assemblyWs.send(JSON.stringify({ audio_data: base64Buffer } as AudioData));
    assemblyWs.send(JSON.stringify({ terminate_session: true } as TerminateSession));
  } else {
    console.log(`No AssemblyAI websocket found to terminate.`);
  }
}

export { initAssemblyWs, transcribeAudio, finishTranscription };
