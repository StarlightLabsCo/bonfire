import { useTranscriptionStore } from '@/stores/audio/transcription-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleVoiceTranscriptionProcessed(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.voiceTranscriptionProcessed) {
    useTranscriptionStore.setState({ transcription: response.data.transcription });
  }
}
