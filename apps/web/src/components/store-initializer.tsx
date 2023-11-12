'use client';

import { useEffect } from 'react';
import { useWebsocketStore } from '@/stores/websocket-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';

export function StoreInitializer() {
  useEffect(() => {
    useWebsocketStore.getState().connect();
    usePlaybackStore.getState().setup();
  }, []);

  return null;
}
