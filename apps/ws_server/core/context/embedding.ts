import { db } from '../../services/db';
import { openai } from '../../services/openai';

export async function embedMessage(messageId: string, content: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: content,
  });

  const embedding = response.data[0].embedding;

  await db.$executeRaw`UPDATE "Message" SET "embedding" = ${embedding}::vector WHERE "id" = ${messageId}`;
}
