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
  volume: number;
  setVolume: (volume: number) => void;
  clearAudio: () => void;
  setup: () => void;
};

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  audioContext: null,
  bufferedPlayerNode: null,
  gainNode: null,
  socketState: '',

  volume: 0.75,
  setVolume: (desiredVolume: number) => {
    const { gainNode } = get();
    if (!gainNode) return;

    const result = Math.max(0, Math.min(1, desiredVolume));
    gainNode.gain.value = result;
    set({ volume: result });
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
