'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '../ws-context';
import {
  StarlightWebSocketRequestType,
  StarlightWebSocketResponse,
  StarlightWebSocketResponseType,
} from 'websocket/types';
import { usePlayback } from './playback-context';
import { AudioRecorder } from '@/lib/audio/recorder';
import { arrayBufferToBase64 } from '@/lib/audio/util';

interface TranscriptionContextType {
  audioRecorder: AudioRecorder | null;
  transcription: string;
  setTranscription: (transcription: string) => void;
}

export const TranscriptionContext = createContext<TranscriptionContextType>({
  audioRecorder: null,
  transcription: '',
  setTranscription: () => {},
});

export function TranscriptionContextProvider({ children }: { children: React.ReactNode }) {
  const { socket, sendToServer, addMessageHandler, removeMessageHandler } = useWebSocket();
  const { audioContext } = usePlayback();

  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [transcription, setTranscription] = useState<string>('');

  function updateTranscription(response: StarlightWebSocketResponse) {
    if (response.type === StarlightWebSocketResponseType.voiceTranscriptionProcessed) {
      setTranscription(response.data.transcription);
    }
  }

  useEffect(() => {
    async function setup() {
      if (!audioContext) return;

      const audioRecorder = new AudioRecorder(audioContext);
      setAudioRecorder(audioRecorder);
    }

    setup();
  }, [audioContext]);

  useEffect(() => {
    if (!socket || !audioRecorder) return;

    audioRecorder.onmessage = (event) => {
      if (event.data) {
        const rawAudio = event.data as Int16Array;
        const base64Audio = arrayBufferToBase64(rawAudio.buffer);

        sendToServer({
          type: StarlightWebSocketRequestType.processVoiceTranscription,
          data: {
            audio: base64Audio,
          },
        });
      } else if (event.type === 'end') {
        sendToServer({
          type: StarlightWebSocketRequestType.finishVoiceTranscription,
          data: {},
        });
      }
    };
  }, [socket, audioRecorder]);

  useEffect(() => {
    if (!socket) return;

    addMessageHandler(updateTranscription);

    return () => {
      removeMessageHandler(updateTranscription);
    };
  }, [socket]);

  return (
    <TranscriptionContext.Provider
      value={{
        audioRecorder,
        transcription,
        setTranscription,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  );
}

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (context === undefined) {
    throw new Error('useTranscription must be used within a TranscriptionProvider');
  }
  return context;
};
