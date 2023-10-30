'use client';

import {
  AudioRecorder,
  arrayBufferToBase64,
  bufferBase64Audio,
  clearBufferedPlayerNodeBuffer,
  setupAudio,
} from '@/lib/audio';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './ws-context';

interface AudioProcessorContextType {
  audioContext: AudioContext | null;
  bufferedPlayerNode: AudioWorkletNode | null;
  setVolume: (volume: number) => void;
  clearAudio: () => void;
  audioRecorder: AudioRecorder | null;
  transcription: string;
  setTranscription: (transcription: string) => void;
}

export const AudioProcessorContext = createContext<AudioProcessorContextType>({
  audioContext: null,
  bufferedPlayerNode: null,
  setVolume: () => {},
  clearAudio: () => {},
  audioRecorder: null,
  transcription: '',
  setTranscription: () => {},
});

export function AudioContextProvider({ children }: { children: React.ReactNode }) {
  const { socket, sendJSON } = useWebSocket();

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const [bufferedPlayerNode, setBufferedPlayerNode] = useState<AudioWorkletNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);

  const [transcription, setTranscription] = useState<string>('');

  function setVolume(volume: number) {
    if (!gainNode) return;
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  function clearAudio() {
    sendJSON({
      type: 'stopAudio',
      payload: {},
    });

    clearBufferedPlayerNodeBuffer(bufferedPlayerNode);
  }

  useEffect(() => {
    async function setup() {
      // ---- Streaming Playback ----
      const { audioContext, bufferedPlayerNode, gainNode } = await setupAudio();

      setAudioContext(audioContext);
      setBufferedPlayerNode(bufferedPlayerNode);
      setGainNode(gainNode);

      // ---- Recording ----
      const audioRecorder = new AudioRecorder(audioContext);
      setAudioRecorder(audioRecorder);

      return () => {
        audioContext.close();
      };
    }
    setup();
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (!audioRecorder) return;

    audioRecorder.onmessage = (event) => {
      if (event.data) {
        const rawAudio = event.data as Int16Array;
        const base64Audio = arrayBufferToBase64(rawAudio.buffer);

        socket.send(JSON.stringify({ type: 'voice', payload: base64Audio }));
      } else if (event.type === 'end') {
        console.log('end');
        socket.send(JSON.stringify({ type: 'voiceEnd' }));
      }
    };
  }, [audioRecorder, socket]);

  useEffect(() => {
    if (!bufferedPlayerNode || !socket) return;

    function handleMessage(event: MessageEvent) {
      const data = JSON.parse(event.data);

      if (data.type === WebSocketResponseType.audio) {
        bufferBase64Audio(audioContext, bufferedPlayerNode, data.payload.content);
      } else if (data.type === WebSocketResponseType.transcription) {
        setTranscription(data.payload.content);
      }
    }

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [audioContext, bufferedPlayerNode, socket]);

  return (
    <AudioProcessorContext.Provider
      value={{
        audioContext,
        bufferedPlayerNode,
        setVolume,
        clearAudio,
        audioRecorder,
        transcription,
        setTranscription,
      }}
    >
      {children}
    </AudioProcessorContext.Provider>
  );
}

export const useAudioProcessor = () => {
  const context = useContext(AudioProcessorContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
