import { createClient } from "redis";

const redis = createClient();

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

//put and import in worker and api files
// await connectRedis();

export async function connectRedis() {
  await redis.connect();
}

export default redis;
