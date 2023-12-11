'use client';

import React from 'react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { User } from 'next-auth';
import { IBM_Plex_Serif } from 'next/font/google';
import Zoom from 'react-medium-image-zoom';
import './image-zoom-styles.css';

import { Instance, Message } from '@prisma/client';
import { OpenSidebar } from '@/components/open-sidebar';
import { StoryInput } from '@/components/input/story-input';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { useWebsocketStore } from '@/stores/websocket-store';
import { Icons } from '../icons';

export const cormorantGaramond = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export function Story({
  user,
  instance,
  dbMessages,
}: {
  user: {
    id: string;
  } & User;
  instance: Instance;
  dbMessages: Message[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const locked = useCurrentInstanceStore((state) => state.locked);
  const lockedAt = useCurrentInstanceStore((state) => state.lockedAt);
  const setInstanceId = useCurrentInstanceStore((state) => state.setInstanceId);
  const setLocked = useCurrentInstanceStore((state) => state.setLocked);
  const setLockedAt = useCurrentInstanceStore((state) => state.setLockedAt);

  const socketState = useWebsocketStore((state) => state.socketState);
  const subscribeToInstance = useCurrentInstanceStore((state) => state.subscribeToInstance);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);

  const messages = useMessagesStore((state) => state.messages);
  const setMessages = useMessagesStore((state) => state.setMessages);

  const submittedMessage = useMessagesStore((state) => state.submittedMessage);
  const setSubmittedMessage = useMessagesStore((state) => state.setSubmittedMessage);
  const streamedMessageId = useMessagesStore((state) => state.streamedMessageId);
  const streamedWords = useMessagesStore((state) => state.streamedWords);

  useEffect(() => {
    setMessages(dbMessages);
  }, [dbMessages, instance.id, setMessages]);

  useEffect(() => {
    clearAudio();
    setSubmittedMessage(null);
    if (instance) {
      setInstanceId(instance.id);
      setLocked(instance.locked);
      setLockedAt(instance.lockedAt);
    }
  }, [instance.id]);

  useEffect(() => {
    if (socketState === 'open' && instance) {
      subscribeToInstance(instance.id);
    }
  }, [socketState, instance, subscribeToInstance]);

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
        const wordIndex = wordTimings.wordStartTimesMs.findIndex((wordStartTime) => wordStartTime >= time);
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

  return (
    <div className="flex flex-col items-center w-full mx-auto h-full relative">
      {user && <OpenSidebar />}
      <div
        ref={messageContainerRef}
        className={`${cormorantGaramond.className} w-full flex flex-col items-center h-full px-8 overflow-y-auto overscroll-none font-[400] text-sm md:text-lg pt-16 md:pt-8`}
      >
        <div className="max-w-3xl w-full flex flex-col items-center gap-y-8 pb-24">
          {messages.map((message: Message) => {
            if (streamedMessageId === message.id && streamedWords) {
              return (
                <div key={message.id} className="w-full">
                  {streamedWords.map((word, index) => {
                    const words = word.split('\n');

                    // No newlines
                    if (words.length === 1) {
                      return (
                        <React.Fragment key={`${message.id}-${index}`}>
                          <span className={`fade-in-fast ${index == currentWordIndex && 'underline'}`}>{word}</span>{' '}
                        </React.Fragment>
                      );
                    } // Newlines in the middle
                    else {
                      return (
                        <>
                          {words.map((word, wordIndex) => (
                            <React.Fragment key={`${message.id}-${index}-${wordIndex}`}>
                              <span className={`fade-in-fast ${wordIndex == currentWordIndex && 'underline'}`}>{word}</span>{' '}
                              {wordIndex !== words.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </>
                      );
                    }
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
                  <div key={message.id} className="w-full">
                    {contentLines.map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                );
              case 'function':
                if (message.name === 'generate_image') {
                  return (
                    <div key={message.id} className="w-full fade-in-fast z-0">
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
            <div className="w-full py-2 pl-6 border-l-2 border-red-500 font-sans flex flex-row items-center gap-x-4">
              <Icons.exclamationTriangle className="w-6 h-6 text-red-500 font-light text-xs" />
              There&apos;s been an error.
            </div>
          )}

          {!error && messages[messages.length - 1]?.role === 'user' && (
            <div className="w-full">
              <div className="h-2 w-2 ml-2 bg-neutral-700 fade-in-5 animate-ping rounded-full" />
            </div>
          )}
          {!error && submittedMessage && messages[messages.length - 1]?.role != 'user' && (
            <>
              <div className="w-full pl-6 border-l-2 border-neutral-700 fade-in-fast">
                <p className="text-neutral-500">{submittedMessage}</p>
              </div>
              <div className="w-full">
                <div className="h-2 w-2 ml-2 bg-neutral-700 fade-in-5 animate-ping rounded-full" />
              </div>
            </>
          )}
          <div ref={scrollRef} />
        </div>
      </div>
      {user && user.id === instance.userId && <StoryInput instance={instance} scrollRef={scrollRef} />}
    </div>
  );
}
