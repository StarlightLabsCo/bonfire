import { CreateInstanceRequest, StarlightWebSocketRequestType } from 'websocket';
import { create } from 'zustand';
import { useWebsocketStore } from './websocket-store';

type LobbyStore = {
  description: string;
  setDescription: (description: string) => void;

  narratorPrompt: string;
  narratorVoiceId: string;
  storyOutline: string;
  imageStyle: string;
  setNarratorPrompt: (prompt: string) => void;
  setNarratorVoiceId: (voiceId: string) => void;
  setStoryOutline: (outline: string) => void;
  setImageStyle: (style: string) => void;

  createInstance: (description: string) => void;
};

export const useLobbyStore = create<LobbyStore>((set) => ({
  description: '',
  setDescription: (description) => set({ description }),

  storyOutline: '',
  imageStyle: '',
  narratorPrompt: '',
  narratorVoiceId: '1Tbay5PQasIwgSzUscmj',
  setStoryOutline: (outline) => set({ storyOutline: outline }),
  setImageStyle: (style) => set({ imageStyle: style }),
  setNarratorPrompt: (prompt) => set({ narratorPrompt: prompt }),
  setNarratorVoiceId: (voiceId) => set({ narratorVoiceId: voiceId }),

  createInstance: (description: string) => {
    const { narratorPrompt, narratorVoiceId, storyOutline, imageStyle } = useLobbyStore.getState();

    const sendToServer = useWebsocketStore.getState().sendToServer;

    sendToServer({
      type: StarlightWebSocketRequestType.createInstance,
      data: {
        description: description,
        narratorPrompt,
        narratorVoiceId,
        storyOutline,
        imageStyle,
      },
    } as CreateInstanceRequest);
  },
}));
