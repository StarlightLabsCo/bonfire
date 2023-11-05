import { bufferBase64Audio } from '@/lib/audio/playback';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleAudioCreated(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.audioCreated) {
    const audioContext = usePlaybackStore.getState().audioContext;
    const bufferedPlayerNode = usePlaybackStore.getState().bufferedPlayerNode;

    bufferBase64Audio(audioContext, bufferedPlayerNode, response.data.audio);
  }
}
