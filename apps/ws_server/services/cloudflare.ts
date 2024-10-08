import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from './db';

if (!process.env.S3_ACCESS_KEY_ID) {
  throw new Error('Missing S3_ACCESS_KEY_ID');
}

if (!process.env.S3_SECRET_ACCESS_KEY) {
  throw new Error('Missing S3_SECRET_ACCESS_KEY');
}

if (!process.env.S3_ENDPOINT) {
  throw new Error('Missing S3_ENDPOINT');
}

if (!process.env.S3_IMAGES_BUCKET) {
  throw new Error('Missing S3_IMAGES_BUCKET');
}

if (!process.env.S3_PUBLIC_URL) {
  throw new Error('Missing S3_PUBLIC_URL');
}

const S3 = new S3Client({
  region: 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

export async function uploadImageToR2(imageURL: string, messageId: string) {
  const response = await fetch(imageURL);
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_IMAGES_BUCKET,
    Key: messageId + '.png',
    Body: imageBuffer,
    ContentType: 'image/png',
  });

  const uploadResponse = await S3.send(uploadCommand);

  if (uploadResponse.$metadata.httpStatusCode != 200) {
    throw new Error('Failed to upload image to S3');
  }

  await db.message.update({
    where: {
      id: messageId,
    },
    data: {
      content: `${process.env.S3_PUBLIC_URL}/${messageId}.png`,
    },
  });
}
