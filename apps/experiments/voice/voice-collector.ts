import OpenAI from 'openai';
const openai = new OpenAI();

import fs from 'fs';
import path from 'path';

import { voices } from './voices';

const BASE_ELEVEN_LABS_URL = 'https://api.elevenlabs.io';

const generateVoiceSample = async (voiceId: string, text: string) => {
  const response = await fetch(`${BASE_ELEVEN_LABS_URL}/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': `${process.env.ELEVEN_LABS_API_KEY}`,
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate voice sample');
  }

  const audio = await response.arrayBuffer();

  return audio;
};

const generateNarratorPersonality = async (label: string, subLabel: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Create a personality, backstory, and brief history for a story narrator named ${label} who is ${subLabel}. Be as detailed as possible, create a unique personality and backstory that would make them stand out.`,
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content;
};

const generateNarratorOneLiner = async (label: string, subLabel: string, personality: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-32k',
    messages: [
      {
        role: 'system',
        content:
          'Given the following personality, backstory, and brief history for a story narrator, create a unique one-liner sentence that the narrator might say to a potential listener. It should match their personality, and be entirely unique to them. Have it reflect on them, not the listener, or the potential story. Avoid annoying language like  "the tapestry of tales, the whispers of the wind" bullshit like that. Keep it real, keep it unique, keep it them.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Narrator: ${label} - ${subLabel}\nPersonality: ${personality}`,
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content;
};

const generateSamples = async () => {
  for (const voice of voices) {
    console.log(`------- Generating samples for ${voice.label}... -------`);
    const personality = await generateNarratorPersonality(voice.label, voice.subLabel);

    console.log(`${voice.label}'s personality: ${personality}`);

    if (!personality) {
      console.error(`Failed to generate narrator personality for voice ${voice.label} - ${voice.subLabel}`);
      continue;
    }

    for (let i = 0; i < 3; i++) {
      console.log(`Generating one liner for ${voice.label} - phrase ${i + 1}...`);
      const oneLiner = await generateNarratorOneLiner(voice.label, voice.subLabel, personality);

      console.log(`${voice.label}'s one liner for phrase ${i + 1}: ${oneLiner}`);

      if (!oneLiner) {
        console.error(`Failed to generate one liner for voice ${voice.label} - ${voice.subLabel}`);
        continue;
      }

      const voiceSample = await generateVoiceSample(voice.value, oneLiner);
      if (!voiceSample) {
        console.error(`Failed to generate voice sample for voice ${voice.label} - ${voice.subLabel}`);
        continue;
      }

      const voiceSampleDirectory = path.join(__dirname, voice.label, `phrase-${i}`);
      if (!fs.existsSync(voiceSampleDirectory)) {
        fs.mkdirSync(voiceSampleDirectory, { recursive: true });
      }
      const voiceSamplePath = path.join(voiceSampleDirectory, `sample.mp3`);
      const buffer = Buffer.from(voiceSample);
      fs.writeFileSync(voiceSamplePath, buffer);
    }
  }
};

// console.log('Generating voice samples...');
// await generateSamples();
// console.log('Voice samples generated!');

// TODO: write a script that goes through all the voices folders, and turns /voice/Alex/phrase-1/sample.mp3 into /voice/Alex/1.mp3

const renameVoiceSamples = async () => {
  const voicesDirectory = path.join(__dirname);
  const voiceFolders = fs
    .readdirSync(voicesDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const voiceFolder of voiceFolders) {
    const voiceFolderPath = path.join(voicesDirectory, voiceFolder);
    const phraseFolders = fs
      .readdirSync(voiceFolderPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const phraseFolder of phraseFolders) {
      const phraseFolderPath = path.join(voiceFolderPath, phraseFolder);
      const sampleFilePath = path.join(phraseFolderPath, 'sample.mp3');
      if (fs.existsSync(sampleFilePath)) {
        const phraseNumber = phraseFolder.split('-')[1];
        const newSampleFilePath = path.join(voiceFolderPath, `${phraseNumber}.mp3`);
        fs.renameSync(sampleFilePath, newSampleFilePath);
        console.log(`Renamed ${sampleFilePath} to ${newSampleFilePath}`);
        fs.rmdirSync(phraseFolderPath, { recursive: true });
        console.log(`Deleted folder ${phraseFolderPath}`);
      }
    }
  }
};

// Call the function to start the renaming process
console.log('Renaming voice samples...');
await renameVoiceSamples();
console.log('Voice samples renamed!');
