'use client';

import { create } from 'zustand';
import { AudioRecorder } from '@/lib/audio/recorder';
import {
  StarlightWebSocketRequestType,
  StarlightWebSocketResponse,
  StarlightWebSocketResponseType,
} from 'websocket/types';
import { usePlaybackStore } from './playback-store';
import { arrayBufferToBase64 } from '@/lib/audio/util';
import { useWebsocketStore } from '../websocket-store';

type State = {
  audioRecorder: AudioRecorder | null;
  transcription: string;
  setAudioRecorder: (audioRecorder: AudioRecorder | null) => void;
  setTranscription: (transcription: string) => void;
  updateTranscription: (response: StarlightWebSocketResponse) => void;
  setupAudioRecorder: () => void;
};

export const useTranscriptionStore = create<State>((set, get) => ({
  audioRecorder: null,
  transcription: '',
  setAudioRecorder: (audioRecorder) => set({ audioRecorder }),
  setTranscription: (transcription) => set({ transcription }),
  updateTranscription: (response) => {
    if (response.type === StarlightWebSocketResponseType.voiceTranscriptionProcessed) {
      set({ transcription: response.data.transcription });
    }
  },
  setupAudioRecorder: () => {
    const sendToServer = useWebsocketStore.getState().sendToServer;
    const audioContext = usePlaybackStore.getState().audioContext;

    console.log('setupAudioRecorder', audioContext);

    if (!audioContext || get().audioRecorder != null) return;

    const audioRecorder = new AudioRecorder(audioContext);

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

    set({ audioRecorder });
  },
}));
