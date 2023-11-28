// Documentation: https://www.npmjs.com/package/ioredis
import Redis from 'ioredis';

const redisURL = new URL(process.env.REDIS_PRIVATE_URL as string);

export const redis = new Redis({
  host: redisURL.hostname,
  port: Number(redisURL.port),
  username: redisURL.username,
  password: redisURL.password,
});
