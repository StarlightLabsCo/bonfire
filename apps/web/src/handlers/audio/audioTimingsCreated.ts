import { bufferBase64Audio } from '@/lib/audio/playback';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleAudioTimingsCreated(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.audioTimingsCreated) {
    console.log('audio timings created', response.data.timings);
  }
}
