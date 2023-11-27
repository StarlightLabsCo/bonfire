import { Instance, Message } from 'database';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export function convertInstanceToChatCompletionMessageParams(instance: Instance & { messages: Message[] }) {
  return instance.messages.map((message) => {
    const filteredMessage = {
      role: message.role,
      content: message.content,
      name: message.name ?? undefined,
      function_call: message.function_call ?? undefined,
    };

    return filteredMessage as ChatCompletionMessageParam;
  });
}
