// Documentation: https://platform.openai.com/docs/introduction

import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { db } from './db';
import { MessageRole } from 'database';
import { encode, encodeChat } from 'gpt-tokenizer';
import { ChatMessage } from 'gpt-tokenizer/GptEncoding';

const openai = new OpenAI();

async function logNonStreamedOpenAIResponse(
  userId: string,
  messages: ChatCompletionMessageParam[],
  response: ChatCompletion,
  time: number,
) {
  await db.openAIRequestLog.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      model: response.model,
      messages: JSON.stringify(messages),
      streamed: false,

      role: response.choices[0].message.role,
      content: response.choices[0].message.content,
      function_call:
        response.choices[0].message.function_call && JSON.stringify(response.choices[0].message.function_call),

      responseTime: time,
      promptTokens: response.usage?.prompt_tokens || -1,
      completionTokens: response.usage?.completion_tokens || -1,
      totalTokens: response.usage?.total_tokens || -1,
    },
  });
}

async function logStreamedOpenAIResponse(
  userId: string,
  messages: ChatCompletionMessageParam[],
  chunks: ChatCompletionChunk[],
  time: number,
) {
  // Input
  const messageTokens = encodeChat(messages as ChatMessage[], 'gpt-4');
  const promptTokens = messageTokens.length;

  // Output
  let content = '';
  let function_call_name = chunks[0].choices[0].delta.function_call?.name || '';
  let function_call_args = '';

  for (const chunk of chunks) {
    if (chunk.choices[0].delta.content) {
      content += chunk.choices[0].delta.content;
    }

    if (chunk.choices[0].delta.function_call?.arguments) {
      function_call_args += chunk.choices[0].delta.function_call.arguments;
    }
  }

  const contentTokens = encode(content);
  const functionCallNameTokens = encode(function_call_name);
  const functionCallArgsTokens = encode(function_call_args);
  const completionTokens = contentTokens.length + functionCallNameTokens.length + functionCallArgsTokens.length;

  let totalTokens = promptTokens + completionTokens;

  // Log
  await db.openAIRequestLog.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      model: chunks[0].model,
      messages: JSON.stringify(messages),
      streamed: true,

      role: chunks[0].choices[0].delta.role! as MessageRole,
      content: content,
      function_call: JSON.stringify({
        name: function_call_name,
        arguments: function_call_args,
      }),

      responseTime: time,
      promptTokens: promptTokens,
      completionTokens: completionTokens,
      totalTokens: totalTokens,
    },
  });
}

export { openai, logNonStreamedOpenAIResponse, logStreamedOpenAIResponse };
