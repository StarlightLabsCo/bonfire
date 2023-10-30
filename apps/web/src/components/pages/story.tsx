'use client';

import { useEffect, useState, useRef } from 'react';

import { Instance, Message } from '@prisma/client';
import { IBM_Plex_Serif } from 'next/font/google';
import { MessageLike, useMessages } from '../contexts/messages-context';
import { useWebSocket } from '../contexts/ws-context';
import { OpenSidebar } from '../open-sidebar';
import { StoryInput } from '../input/story-input';
import { User } from 'next-auth';

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
  const { setInstanceId } = useWebSocket();
  const { messages, setMessages } = useMessages();
  const [latestMessage, setLatestMessage] = useState<{
    id: string;
    role: string;
    words: string[];
  }>();

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
  }, [messages]);

  useEffect(() => {
    const lastAssistantMessage = messages
      .filter((message) => message.role === 'assistant')
      .slice(-1)[0];

    if (lastAssistantMessage) {
      setLatestMessage({
        id: lastAssistantMessage.id,
        role: lastAssistantMessage.role,
        words: lastAssistantMessage.content.split(' '),
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col items-center w-full h-full px-8 pb-2 md:px-16">
      {user && <OpenSidebar />}
      <div
        className={`${cormorantGaramond.className} h-full flex flex-col items-center w-full overflow-y-auto gap-y-8 leading-8 font-[400] text-sm md:text-lg pt-8`}
      >
        {messages.map((message: MessageLike) => {
          if (
            message.id === latestMessage?.id &&
            message.role === 'assistant'
          ) {
            return (
              <div key={message.id} className="w-full">
                {latestMessage.words.map((word, index) => (
                  <span key={`${message.id}-${index}`} className="fade-in-fast">
                    {word}{' '}
                  </span>
                ))}
              </div>
            );
          }

          switch (message.role) {
            case 'user':
              return (
                <div
                  key={message.id}
                  className="w-full pl-6 border-l-2 border-neutral-700 fade-in-fast"
                >
                  <p className="text-neutral-500">{message.content}</p>
                </div>
              );
            case 'assistant':
              return (
                <div key={message.id} className="w-full">
                  {message.content}
                </div>
              );
            case 'function':
              const data = message.content && JSON.parse(message.content);
              if (data.type === 'generate_image' && data.payload['imageURL']) {
                return (
                  <div key={message.id} className="w-full fade-in-fast">
                    <img
                      src={data.payload['imageURL']}
                      className="rounded-2xl fade-in-2s"
                      alt="Generated image"
                    />
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
        <div ref={endOfMessagesRef} />
      </div>
      {user && user.id === instance.userId && (
        <StoryInput instanceId={instance.id} />
      )}
    </div>
  );
}
