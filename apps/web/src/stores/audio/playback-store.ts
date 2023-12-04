'use client';

import { create } from 'zustand';
import { setupAudio } from '@/lib/audio';
import { clearBufferedPlayerNodeBuffer } from '@/lib/audio/playback';
import { AudioWordTimings, StarlightWebSocketRequestType, StopAudioRequest } from 'websocket/types';
import { useWebsocketStore } from '../websocket-store';
import { useTranscriptionStore } from './transcription-store';

type PlaybackStore = {
  audioContext: AudioContext | null;
  bufferedPlayerNode: AudioWorkletNode | null;
  gainNode: GainNode | null;
  socketState: string;
  volume: number | null;
  currentWordIndex: number | null;
  wordTimings: AudioWordTimings | null;
  audioStartTime: number | null;
  setVolume: (volume: number) => void;
  setCurrentWordIndex: (currentWordIndex: number) => void;
  setWordTimings: (wordTimings: AudioWordTimings) => void;
  setAudioStartTime: (audioStartTime: number) => void;
  clearAudio: () => void;
  setup: () => void;
};

// TODO: clean up
export const usePlaybackStore = create<PlaybackStore>((set, get) => {
  return {
    audioContext: null,
    bufferedPlayerNode: null,
    gainNode: null,
    socketState: '',
    volume: null,
    currentWordIndex: null,
    wordTimings: null,
    audioStartTime: null,
    setVolume: (desiredVolume: number) => {
      const { gainNode } = get();
      if (!gainNode) return;

      const result = Math.max(0, Math.min(1, desiredVolume));
      gainNode.gain.value = result;
      set({ volume: result });

      localStorage.setItem('volume', result.toString());
    },
    setCurrentWordIndex: (currentWordIndex: number) => {
      set({ currentWordIndex });
    },
    setWordTimings: (wordTimings: AudioWordTimings) => {
      set({ wordTimings });
    },
    setAudioStartTime: (audioStartTime: number) => {
      set({ audioStartTime });
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
