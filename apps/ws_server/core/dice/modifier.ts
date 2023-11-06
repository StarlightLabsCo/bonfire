import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function generateModifier(instanceId: string, messages: ChatCompletionMessageParam[]) {
  console.log(`Generating modifier for ${instanceId} with ${messages.length} messages - Not implemented yet`);
}
