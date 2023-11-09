import OpenAI from 'openai';
const openai = new OpenAI();

async function main() {
  const startTime = new Date();

  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Based on the story, pick the most interesting concept, character, or idea from the most recent story addition and generate an image prompt to go with it. This could be a scene, a character, or an object. Use the examples to guide you. Keep it consistent with the story. Only output the prompt.',
          },
          {
            type: 'image_url',
            image_url:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg' as any,
          },
        ],
      },
    ],
  });

  const endTime = new Date();

  console.log(response);
  console.log(`Time elapsed: ${endTime.getTime() - startTime.getTime()}ms`);
}

main();
