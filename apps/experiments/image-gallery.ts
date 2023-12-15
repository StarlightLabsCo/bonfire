import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';

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

const server = Bun.serve({
  port: 3000,
  async fetch(request: Request) {
    // Create a new instance of the ListObjectsCommand
    const command = new ListObjectsCommand({
      Bucket: process.env.S3_IMAGES_BUCKET,
    });

    // Send the command to the S3 client
    const response = await S3.send(command);

    // Get the objects from the response
    const objects = response.Contents || [];

    // Generate an HTML page with all the images
    let html = '<html><body>';
    for (const object of objects) {
      if (!object.Key) {
        continue;
      }

      if (object.Key.endsWith('.jpg') || object.Key.endsWith('.png')) {
        html += `<img src="${process.env.S3_PUBLIC_URL}/${object.Key}" />`;
      }
    }
    html += '</body></html>';

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  },
});

console.log(`Listening on localhost: ${server.port}`);
