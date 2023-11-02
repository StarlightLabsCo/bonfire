'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '../ws-context';
import {
  StarlightWebSocketRequestType,
  StarlightWebSocketResponse,
  StarlightWebSocketResponseType,
  StopAudioRequest,
} from 'websocket/types';
import { setupAudio } from '@/lib/audio';
import { bufferBase64Audio, clearBufferedPlayerNodeBuffer } from '@/lib/audio/playback';

interface PlaybackContextType {
  audioContext: AudioContext | null;
  bufferedPlayerNode: AudioWorkletNode | null;
  setVolume: (volume: number) => void;
  clearAudio: () => void;
}

export const PlaybackContext = createContext<PlaybackContextType>({
  audioContext: null,
  bufferedPlayerNode: null,
  setVolume: () => {},
  clearAudio: () => {},
});

export function PlaybackContextProvider({ children }: { children: React.ReactNode }) {
  const { socketState, sendToServer, addMessageHandler, removeMessageHandler } = useWebSocket();

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [bufferedPlayerNode, setBufferedPlayerNode] = useState<AudioWorkletNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // ** --------- Functions --------- **
  function setVolume(volume: number) {
    if (!gainNode) return;
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  function clearAudio() {
    sendToServer({
      type: StarlightWebSocketRequestType.stopAudio,
      data: {},
    } as StopAudioRequest);

    clearBufferedPlayerNodeBuffer(bufferedPlayerNode);
  }

  function bufferAudio(response: StarlightWebSocketResponse) {
    if (response.type === StarlightWebSocketResponseType.audioCreated) {
      bufferBase64Audio(audioContext, bufferedPlayerNode, response.data.audio);
    }
  }

  // ** --------- Effects --------- **
  useEffect(() => {
    async function setup() {
      const { audioContext, bufferedPlayerNode, gainNode } = await setupAudio();

      setAudioContext(audioContext);
      setBufferedPlayerNode(bufferedPlayerNode);
      setGainNode(gainNode);

      return () => {
        audioContext.close();
      };
    }

    setup();
  }, []);

  useEffect(() => {
    if (!bufferedPlayerNode || socketState != 'open') return;

    addMessageHandler(bufferAudio);

    return () => {
      removeMessageHandler(bufferAudio);
    };
  }, [audioContext, bufferedPlayerNode, socketState]);

  return (
    <PlaybackContext.Provider
      value={{
        audioContext,
        bufferedPlayerNode,
        setVolume,
        clearAudio,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};
