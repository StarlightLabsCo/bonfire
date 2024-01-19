import { CreateInstanceRequest, StarlightWebSocketRequestType } from 'websocket';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWebsocketStore } from './websocket-store';

type LobbyStore = {
  description: string;
  setDescription: (description: string) => void;

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

  createInstance: (description: string) => void;
};

export const useLobbyStore = create<LobbyStore>()(
  persist(
    (set, get) => ({
      description: '',
      setDescription: (description) => set({ description }),

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

      createInstance: (description: string) => {
        const { narratorPrompt, narratorVoiceId, narratorResponseLength, storyOutline, imageStyle } = get();

        const sendToServer = useWebsocketStore.getState().sendToServer;

        sendToServer({
          type: StarlightWebSocketRequestType.createInstance,
          data: {
            description: description,
            narratorPrompt,
            narratorVoiceId,
            narratorResponseLength,
            storyOutline,
            imageStyle,
          },
        } as CreateInstanceRequest);
      },
    }),
    {
      name: 'lobby-store', // unique name for local storage key
      getStorage: () => localStorage, // specify local storage as the storage option
    },
  ),
);
