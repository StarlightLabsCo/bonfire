'use client';

import React, { useCallback } from 'react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { IBM_Plex_Serif } from 'next/font/google';
import Zoom from 'react-medium-image-zoom';
import './image-zoom-styles.css';

import { Message } from '@prisma/client';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { useWebsocketStore } from '@/stores/websocket-store';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Icons } from '../icons';
import { cn } from '@/lib/utils';
import { bufferBase64Audio, clearBufferedPlayerNodeBuffer } from '@/lib/audio/playback';
import { ExampleStoryInput } from '../input/example-story-input';

export const cormorantGaramond = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

type ExampleStoryProps = {
  story: Object;
};

export function ExampleStory({ story }: ExampleStoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const locked = useCurrentInstanceStore((state) => state.locked);
  const lockedAt = useCurrentInstanceStore((state) => state.lockedAt);
  const setInstanceId = useCurrentInstanceStore((state) => state.setInstanceId);
  const setLocked = useCurrentInstanceStore((state) => state.setLocked);
  const setLockedAt = useCurrentInstanceStore((state) => state.setLockedAt);
  const setStage = useCurrentInstanceStore((state) => state.setStage);

  const socketState = useWebsocketStore((state) => state.socketState);
  const subscribeToInstance = useCurrentInstanceStore((state) => state.subscribeToInstance);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);

  const messages = useMessagesStore((state) => state.messages);
  const setMessages = useMessagesStore((state) => state.setMessages);

  const submittedMessage = useMessagesStore((state) => state.submittedMessage);
  const setSubmittedMessage = useMessagesStore((state) => state.setSubmittedMessage);
  const streamedMessageId = useMessagesStore((state) => state.streamedMessageId);
  const streamedWords = useMessagesStore((state) => state.streamedWords);

  // Mobile Header useEffect
  const messageContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (!messageContainerRef.current) return;

      const {
        storyMessageContainerScrollTop: scrollTop,
        setStoryMessageContainerScrollTop: setScrollTop,
        mobileHeaderHeight,
        setMobileHeaderHeight,
      } = useSidebarStore.getState();

      if (messageContainerRef.current.scrollTop < scrollTop) {
        setMobileHeaderHeight(Math.min(0, mobileHeaderHeight + scrollTop - messageContainerRef.current.scrollTop));
      } else {
        setMobileHeaderHeight(Math.max(-40, mobileHeaderHeight - (messageContainerRef.current.scrollTop - scrollTop)));
      }

      setScrollTop(messageContainerRef.current.scrollTop);
    };

    messageContainerRef.current?.addEventListener('scroll', handleScroll);

    return () => {
      messageContainerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Word timings useEffect
  const wordTimings = usePlaybackStore((state) => state.wordTimings);
  const audioStartTime = usePlaybackStore((state) => state.audioStartTime);
  const currentWordIndex = usePlaybackStore((state) => state.currentWordIndex);

  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const checkWordTimings = () => {
      if (wordTimings && audioStartTime) {
        const time = Date.now() - audioStartTime;
        let wordIndex = wordTimings.wordStartTimesMs.findIndex((wordStartTime) => wordStartTime >= time);

        if (wordIndex === -1) {
          wordIndex = streamedWords ? streamedWords.length : 0;

          // Update messageStore to remove streamed words (since they've been spoken already)
          useMessagesStore.getState().setStreamedWords(null);
          useMessagesStore.getState().setStreamedMessageId(null);
        }

        usePlaybackStore.getState().setCurrentWordIndex(wordIndex);
      }
      frameRef.current = requestAnimationFrame(checkWordTimings);
    };

    checkWordTimings();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [wordTimings, audioStartTime]);

  const error = locked && lockedAt && new Date().getTime() - new Date(lockedAt).getTime() > 60 * 1000 * 5;

  // Replay Audio
  const replayAudio = useCallback(
    async (message: Message) => {
      if (message.audioUrl && message.audioWordTimings) {
        console.log(`Replaying audio for message ${message.id}`);
        const data = await fetch(message.audioUrl);
        const blob = await data.blob();

        const audioContext = usePlaybackStore.getState().audioContext;
        const bufferedPlayerNode = usePlaybackStore.getState().bufferedPlayerNode;

        // Setup
        usePlaybackStore.getState().setWordTimings(JSON.parse(message.audioWordTimings));
        useMessagesStore.getState().setStreamedMessageId(message.id);
        useMessagesStore.getState().setStreamedWords(message.content.split(' '));

        clearBufferedPlayerNodeBuffer(bufferedPlayerNode);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64AudioString = reader.result;
          if (typeof base64AudioString !== 'string') return;

          const base64Data = base64AudioString.split(',')[1];

          // Play
          usePlaybackStore.getState().setAudioStartTime(Date.now());
          if (typeof base64AudioString === 'string') {
            bufferBase64Audio(audioContext, bufferedPlayerNode, base64Data);
          }
        };
      } else {
        console.error(`No audio or word timings for message ${message.id}`);
      }
    },
    [streamedMessageId, streamedWords],
  );

  return (
    <div className="flex flex-col items-center w-full mx-auto h-[100dvh] relative">
      <div
        ref={messageContainerRef}
        className={`${cormorantGaramond.className} w-full flex flex-col items-center h-full px-8 overflow-auto overscroll-none font-[400] text-sm md:text-lg pt-16 md:pt-8`}
      >
        <div className="flex flex-col items-center w-full max-w-3xl pb-24 gap-y-8">
          {messages.map((message: Message) => {
            if (streamedMessageId === message.id && streamedWords) {
              return (
                <div key={message.id} className="flex flex-wrap w-full">
                  {streamedWords.map((word, index) => {
                    const words = word.split('\n');
                    return (
                      <React.Fragment key={`${message.id}-${index}`}>
                        {words.map((word, wordIndex) => {
                          const isSpoken = index < (currentWordIndex ?? 0);
                          return (
                            <>
                              <span
                                key={`${message.id}-${index}-${wordIndex}`}
                                className={cn(`fade-in-fast transition-colors duration-300`, isSpoken ? 'text-white' : 'text-white/20')}
                              >
                                {word}
                              </span>
                              {wordIndex !== words.length - 1 ? <br /> : <span>&nbsp;</span>}
                            </>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }

            switch (message.role) {
              case 'user':
                return (
                  <div key={message.id} className="w-full pl-6 border-l-2 border-neutral-700">
                    <p className="text-neutral-500">{message.content}</p>
                  </div>
                );
              case 'assistant':
                const contentLines = message.content.split('\n');
                return (
                  <ContextMenu key={message.id}>
                    <ContextMenuTrigger>
                      <div className="w-full select-none">
                        {contentLines.map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem>
                        <div className="flex items-center gap-x-2" onClick={() => navigator.clipboard.writeText(message.content)}>
                          <Icons.clipboard />
                          Copy Text
                        </div>
                      </ContextMenuItem>
                      {message.audioUrl && message.audioWordTimings && (
                        <ContextMenuItem>
                          <div className="flex items-center gap-x-2" onClick={() => replayAudio(message)}>
                            <Icons.speakerLoud />
                            Replay Audio
                          </div>
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                );
              case 'function':
                if (message.name === 'generate_image') {
                  return (
                    <div key={message.id} className="z-0 w-full fade-in-fast">
                      <Zoom>
                        <Image src={message.content} width={1792} height={1024} className="rounded-2xl fade-in-2s" alt="Generated image" />
                      </Zoom>
                    </div>
                  );
                } else return null;

              default:
                return null;
            }
          })}
          {error && (
            <div className="flex flex-row items-center w-full py-2 pl-6 font-sans border-l-2 border-red-500 gap-x-4">
              <Icons.exclamationTriangle className="w-6 h-6 text-xs font-light text-red-500" />
              There&apos;s been an error.
            </div>
          )}

          {!error && messages[messages.length - 1]?.role === 'user' && (
            <div className="w-full">
              <div className="w-2 h-2 ml-2 rounded-full bg-neutral-700 fade-in-5 animate-ping" />
            </div>
          )}
          {!error && submittedMessage && messages[messages.length - 1]?.role != 'user' && (
            <>
              <div className="w-full pl-6 border-l-2 border-neutral-700 fade-in-fast">
                <p className="text-neutral-500">{submittedMessage}</p>
              </div>
              <div className="w-full">
                <div className="w-2 h-2 ml-2 rounded-full bg-neutral-700 fade-in-5 animate-ping" />
              </div>
            </>
          )}
          <div className="h-16" />
          <div ref={scrollRef} />
        </div>
      </div>
      <ExampleStoryInput scrollRef={scrollRef} />
    </div>
  );
}
