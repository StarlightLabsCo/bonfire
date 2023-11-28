// Documentation: https://www.npmjs.com/package/ioredis
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_PRIVATE_URL as string);
