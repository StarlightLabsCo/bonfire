// Documentation: https://www.npmjs.com/package/ioredis
import Redis from 'ioredis';

export const redis = new Redis({
  port: process.env.REDISPORT ? parseInt(process.env.REDISPORT) : 6379,
  host: process.env.REDISHOST || 'localhost',
  username: process.env.REDISUSER,
  password: process.env.REDISPASSWORD,
});
