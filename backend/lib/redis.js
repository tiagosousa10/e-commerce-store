import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

// Create Redis client with proper error handling and retry configuration
export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableOfflineQueue: false, // Don't queue commands when offline
  lazyConnect: false,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Track connection status
let isRedisConnected = false;

// Handle connection events
redis.on('connect', () => {
  isRedisConnected = true;
  console.log('Redis connected successfully');
});

redis.on('ready', () => {
  isRedisConnected = true;
  console.log('Redis is ready');
});

redis.on('error', (error) => {
  isRedisConnected = false;
  // Only log errors, don't crash the application
  console.warn('Redis connection error:', error.message);
});

redis.on('close', () => {
  isRedisConnected = false;
  console.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// Helper function to safely execute Redis commands
export const safeRedisGet = async (key) => {
  if (!isRedisConnected) {
    return null;
  }
  try {
    return await redis.get(key);
  } catch (error) {
    console.warn('Redis GET error:', error.message);
    return null;
  }
};

export const safeRedisSet = async (key, value, ...args) => {
  if (!isRedisConnected) {
    return false;
  }
  try {
    await redis.set(key, value, ...args);
    return true;
  } catch (error) {
    console.warn('Redis SET error:', error.message);
    return false;
  }
};

export const safeRedisDel = async (key) => {
  if (!isRedisConnected) {
    return false;
  }
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn('Redis DEL error:', error.message);
    return false;
  }
};

export { isRedisConnected };


