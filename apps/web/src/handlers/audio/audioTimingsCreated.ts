import { usePlaybackStore } from '@/stores/audio/playback-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleAudioTimingsCreated(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.audioTimingsCreated) {
    usePlaybackStore.getState().setWordTimings(response.data.timings);
  }
}
