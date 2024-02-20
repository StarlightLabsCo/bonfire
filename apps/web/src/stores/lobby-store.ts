import { CreateInstanceRequest, StarlightWebSocketRequestType } from 'websocket';
import { create } from 'zustand';
import { useWebsocketStore } from './websocket-store';

type LobbyStore = {
  storyTitle: string;
  storyOutline: string;
  imageStyle: string;
  narratorPrompt: string;
  narratorVoiceId: string;
  narratorResponseLength: number;

  setStoryTitle: (title: string) => void;
  setStoryOutline: (outline: string) => void;
  setImageStyle: (style: string) => void;
  setNarratorPrompt: (prompt: string) => void;
  setNarratorVoiceId: (voiceId: string) => void;
  setNarratorResponseLength: (length: number) => void;

  createInstance: () => void;
};

export const useLobbyStore = create<LobbyStore>()((set, get) => ({
  storyTitle: '',
  storyOutline: '',
  imageStyle: '',
  narratorPrompt: '',
  narratorVoiceId: '1Tbay5PQasIwgSzUscmj',
  narratorResponseLength: 5,

  setStoryTitle: (title) => set({ storyTitle: title }),
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
        title: get().storyTitle,
        narratorPrompt,
        narratorVoiceId,
        narratorResponseLength,
        storyOutline,
        imageStyle,
      },
    } as CreateInstanceRequest);
  },
}));
