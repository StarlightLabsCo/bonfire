// Documentation: https://replicate.com/stability-ai/sdxl/api
import Replicate from 'replicate';
import { db } from './prisma';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN is not defined');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateImage(
  requestingUserId: string,
  prompt: string,
  negative_prompt: string,
) {
  const width = 1344;
  const height = 768;
  const scheduler = 'KarrasDPM';
  const refine = 'expert_ensemble_refiner';

  const replicateRequestLog = await db.replicateRequestLog.create({
    data: {
      user: {
        connect: {
          id: requestingUserId,
        },
      },
      prompt,
      negativePrompt: negative_prompt,
      width,
      height,
      scheduler,
      refine,
    },
  });

  const date = new Date();

  const output = await replicate.run(
    'stability-ai/sdxl:af1a68a271597604546c09c64aabcd7782c114a63539a4a8d14d1eeda5630c33',
    {
      input: {
        prompt,
        negative_prompt,
        width,
        height,
        scheduler,
        refine,
        apply_watermark: false,
      },
    },
  );

  const finishDate = new Date();

  const imageURL = (output as string[])[0];

  await db.replicateRequestLog.update({
    where: {
      id: replicateRequestLog.id,
    },
    data: {
      imageURL,
      time: finishDate.getTime() - date.getTime(),
    },
  });

  return imageURL;
}

export { generateImage };
