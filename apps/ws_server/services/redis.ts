// Documentation: https://www.npmjs.com/package/ioredis
import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_PRIVATE_URL not found');
}

const redisURL = new URL(process.env.REDIS_URL);

export const redis = new Redis({
  family: 0,
  host: redisURL.hostname,
  port: parseInt(redisURL.port),
  username: redisURL.username,
  password: redisURL.password,
});
