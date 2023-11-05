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
  setVolume: (volume: number) => void;
  clearAudio: () => void;
  setup: () => void;
};

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  audioContext: null,
  bufferedPlayerNode: null,
  gainNode: null,
  socketState: '',

  setVolume: (volume: number) => {
    const { gainNode } = get();
    if (!gainNode) return;
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
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
    const { audioContext, bufferedPlayerNode, gainNode } = await setupAudio();

    set({ audioContext, bufferedPlayerNode, gainNode });

    useTranscriptionStore.getState().setupAudioRecorder();
  },
}));

usePlaybackStore.getState().setup();
