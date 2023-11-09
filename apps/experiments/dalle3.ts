import OpenAI from 'openai';
const openai = new OpenAI();

async function main() {
  const startTime = new Date();
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: 'a white siamese cat',
    n: 1,
    size: '1792x1024',
    quality: 'hd',
  });
  const endTime = new Date();

  console.log(response);
  console.log(`Time elapsed: ${endTime.getTime() - startTime.getTime()}ms`);
}

main();
