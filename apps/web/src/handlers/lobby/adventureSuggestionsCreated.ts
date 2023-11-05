import { useAdventureSuggestionsStore } from '@/stores/adventure-suggestions-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleAdventureSuggestionsCreated(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.adventureSuggestionsCreated) {
    useAdventureSuggestionsStore.setState({ adventureSuggestions: response.data.suggestions });
  }
}
