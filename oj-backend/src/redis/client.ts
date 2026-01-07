import { createClient, type RedisClientType } from "redis";

export const redis: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

//put and import in worker and api files
// await connectRedis();

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export default redis;
