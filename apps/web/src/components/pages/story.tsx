'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import './image-zoom-styles.css';

import { Instance, Message } from '@prisma/client';
import { IBM_Plex_Serif } from 'next/font/google';
import { OpenSidebar } from '../open-sidebar';
import { StoryInput } from '../input/story-input';
import { User } from 'next-auth';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import React from 'react';

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
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const setInstanceId = useCurrentInstanceStore((state) => state.setInstanceId);
  const messages = useMessagesStore((state) => state.messages);
  const setMessages = useMessagesStore((state) => state.setMessages);

  const submittedMessage = useMessagesStore((state) => state.submittedMessage);
  const streamedMessageId = useMessagesStore((state) => state.streamedMessageId);
  const streamedWords = useMessagesStore((state) => state.streamedWords);

  useEffect(() => {
    setMessages(dbMessages);
  }, [dbMessages, instance.id, setMessages]);

  useEffect(() => {
    if (instance.id && setInstanceId) {
      setInstanceId(instance.id);
    }
  }, [instance.id, setInstanceId]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [messages, submittedMessage]);

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

  return (
    <div className="flex flex-col items-center w-full h-full px-8 pb-2 md:px-16">
      {user && <OpenSidebar />}
      <div
        ref={messageContainerRef}
        className={`${cormorantGaramond.className} h-full flex flex-col items-center w-full overflow-y-auto gap-y-8 leading-8 font-[400] text-sm md:text-lg pt-8`}
      >
        {messages.map((message: Message) => {
          if (streamedMessageId === message.id && streamedWords) {
            return (
              <div key={message.id} className="w-full">
                {streamedWords.map((word, index) => {
                  const lines = word.split('\n');
                  return lines.map((line, lineIndex) => {
                    if (lineIndex < lines.length - 1) {
                      return (
                        <React.Fragment key={`${message.id}-${index}-${lineIndex}`}>
                          {line}
                          <br />
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <span key={`${message.id}-${index}-${lineIndex}`} className="fade-in-fast">
                          {line}{' '}
                        </span>
                      );
                    }
                  });
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
                  <div key={message.id} className="w-full fade-in-fast">
                    <Zoom>
                      <Image
                        src={message.content}
                        width={1792}
                        height={1024}
                        className="rounded-2xl fade-in-2s"
                        alt="Generated image"
                      />
                    </Zoom>
                  </div>
                );
              } else return null;

            default:
              return null;
          }
        })}
        {messages[messages.length - 1]?.role === 'user' && (
          <div className="w-full">
            <div className="h-2 w-2 ml-2 bg-neutral-700 fade-in-5 animate-ping rounded-full" />
          </div>
        )}
        {submittedMessage && messages[messages.length - 1]?.role != 'user' && (
          <>
            <div className="w-full pl-6 border-l-2 border-neutral-700 fade-in-fast">
              <p className="text-neutral-500">{submittedMessage}</p>
            </div>
            <div className="w-full">
              <div className="h-2 w-2 ml-2 bg-neutral-700 fade-in-5 animate-ping rounded-full" />
            </div>
          </>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      {user && user.id === instance.userId && <StoryInput instanceId={instance.id} />}
    </div>
  );
}
