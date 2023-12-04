import { bufferBase64Audio, clearBufferedPlayerNodeBuffer } from '@/lib/audio/playback';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleAudioCreated(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.audioCreated) {
    const audioContext = usePlaybackStore.getState().audioContext;
    const bufferedPlayerNode = usePlaybackStore.getState().bufferedPlayerNode;

    if (response.data.start) {
      clearBufferedPlayerNodeBuffer(bufferedPlayerNode);
      usePlaybackStore.getState().setAudioStartTime(Date.now());
    }

    if (response.data.audio) {
      bufferBase64Audio(audioContext, bufferedPlayerNode, response.data.audio);
    }

    if (response.data.end) {
      // TODO: set flag to indicate that audio is done streaming
    }
  }
}
