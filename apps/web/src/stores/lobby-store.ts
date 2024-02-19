import { CreateInstanceRequest, StarlightWebSocketRequestType } from 'websocket';
import { create } from 'zustand';
import { useWebsocketStore } from './websocket-store';

type LobbyStore = {
  narratorPrompt: string;
  narratorVoiceId: string;
  narratorResponseLength: number;
  storyOutline: string;
  imageStyle: string;
  setNarratorPrompt: (prompt: string) => void;
  setNarratorVoiceId: (voiceId: string) => void;
  setNarratorResponseLength: (length: number) => void;
  setStoryOutline: (outline: string) => void;
  setImageStyle: (style: string) => void;

  createInstance: () => void;
};

export const useLobbyStore = create<LobbyStore>()((set, get) => ({
  storyOutline: '',
  imageStyle: '',
  narratorPrompt: '',
  narratorVoiceId: '1Tbay5PQasIwgSzUscmj',
  narratorResponseLength: 5,

  setStoryOutline: (outline) => set({ storyOutline: outline }),
  setImageStyle: (style) => set({ imageStyle: style }),
  setNarratorPrompt: (prompt) => set({ narratorPrompt: prompt }),
  setNarratorVoiceId: (voiceId) => set({ narratorVoiceId: voiceId }),
  setNarratorResponseLength: (length) => set({ narratorResponseLength: length }),

  createInstance: () => {
    const { narratorPrompt, narratorVoiceId, narratorResponseLength, storyOutline, imageStyle } = get();

    const sendToServer = useWebsocketStore.getState().sendToServer;

    sendToServer({
      type: StarlightWebSocketRequestType.createInstance,
      data: {
        narratorPrompt,
        narratorVoiceId,
        narratorResponseLength,
        storyOutline,
        imageStyle,
      },
    } as CreateInstanceRequest);
  },
}));
