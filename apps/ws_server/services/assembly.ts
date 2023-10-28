// Documentation: https://www.assemblyai.com/docs/guides/real-time-streaming-transcription

const SAMPLE_RATE = 44100;
const userIdToAssemblyWebsockets: { [key: string]: WebSocket } = {};

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
type AssemblyAIWebsocketResponse =
  | SessionBegins
  | PartialTranscript
  | FinalTranscript
  | SessionTerminated;

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
const errorMessages: { [key: number]: string } = {
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
async function initAssemblyWs(userId: string) {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    throw new Error('ASSEMBLYAI_API_KEY is not defined');
  }

  // TODO: idea add word boost for suggestions?
  const assemblyWs = new WebSocket(
    `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${SAMPLE_RATE}`,
    {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    },
  );

  assemblyWs.addEventListener('message', (event) => {
    const data = JSON.parse(event.data as string);

    if (data.text) {
      // TODO: make a generic send function that is typed and also fetches the most latest websocket for the user rather than having to pass it in.
      // send(ws, {
      //   type: WebSocketResponseType.transcription,
      //   payload: {
      //     id: '',
      //     content: data.text,
      //   },
      // });
    }

    // TODO: I think the terminate session here might be what's causing bad experience when you stop talking for a while.
    if (data.message_type === 'FinalMessage') {
      assemblyWs.send(JSON.stringify({ terminate_session: true }));
    } else if (data.message_type === 'SessionTerminated') {
      assemblyWs.close();
      delete userIdToAssemblyWebsockets[userId];
    }
  });

  assemblyWs.addEventListener('error', (err) => {
    console.error(`[${userId}] Error from AssemblyAI.`, err);
    assemblyWs.close();
    delete userIdToAssemblyWebsockets[userId];
  });

  assemblyWs.addEventListener('close', (event) => {
    console.log(`[${userId}] Disconnected from AssemblyAI.`);
    delete userIdToAssemblyWebsockets[userId];

    if (event.code in errorMessages) {
      console.error(
        `[${userId}] Error from AssemblyAI: ${errorMessages[event.code]}`,
      );
    }
  });

  return await new Promise<WebSocket>((resolve) => {
    assemblyWs.addEventListener('open', () => {
      userIdToAssemblyWebsockets[userId] = assemblyWs;
      resolve(assemblyWs);
    });
  });
}

async function transcribeAudio(userId: string, base64Audio: string) {
  let assemblyWs = userIdToAssemblyWebsockets[userId];
  if (!assemblyWs) {
    console.log(`[${userId}] Initializing AssemblyAI websocket.`);
    assemblyWs = await initAssemblyWs(userId);
  }

  try {
    console.log(`[${userId}] Sending data to AssemblyAI.`);
    assemblyWs.send(JSON.stringify({ audio_data: base64Audio }));
  } catch (e) {
    console.error(`[${userId}] Error sending data to AssemblyAI.`, e);
  }
}

async function finishTranscription(userId: string) {
  const assemblyWs = userIdToAssemblyWebsockets[userId];

  if (assemblyWs) {
    const base64Buffer = Buffer.alloc(44100 * 2).toString('base64');
    assemblyWs.send(JSON.stringify({ audio_data: base64Buffer }));
    assemblyWs.send(JSON.stringify({ terminate_session: true }));
  } else {
    console.log(`[${userId}] No AssemblyAI websocket found to terminate.`);
  }
}

export { initAssemblyWs, transcribeAudio, finishTranscription };
