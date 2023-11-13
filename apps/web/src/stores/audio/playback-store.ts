'use client';

import { create } from 'zustand';
import { setupAudio } from '@/lib/audio';
import { clearBufferedPlayerNodeBuffer } from '@/lib/audio/playback';
import { StarlightWebSocketRequestType, StopAudioRequest } from 'websocket/types';
import { useWebsocketStore } from '../websocket-store';
import { useTranscriptionStore } from './transcription-store';

type PlaybackStore = {
  audioContext: AudioContext | null;
  bufferedPlayerNode: AudioWorkletNode | null;
  gainNode: GainNode | null;
  socketState: string;
  volume: number | null;
  setVolume: (volume: number) => void;
  clearAudio: () => void;
  setup: () => void;
};

export const usePlaybackStore = create<PlaybackStore>((set, get) => {
  return {
    audioContext: null,
    bufferedPlayerNode: null,
    gainNode: null,
    socketState: '',
    volume: null,
    setVolume: (desiredVolume: number) => {
      const { gainNode } = get();
      if (!gainNode) return;

      const result = Math.max(0, Math.min(1, desiredVolume));
      gainNode.gain.value = result;
      set({ volume: result });

      localStorage.setItem('volume', result.toString());
    },
    clearAudio: () => {
      const sendToServer = useWebsocketStore.getState().sendToServer;
      sendToServer({
        type: StarlightWebSocketRequestType.stopAudio,
        data: {},
      } as StopAudioRequest);

      const { bufferedPlayerNode } = get();
      clearBufferedPlayerNodeBuffer(bufferedPlayerNode);
    },
    setup: async () => {
      const { audioContext, bufferedPlayerNode, gainNode, volume } = await setupAudio();

      set({ audioContext, bufferedPlayerNode, gainNode, volume });

      useTranscriptionStore.getState().setupAudioRecorder();
    },
  };
});
