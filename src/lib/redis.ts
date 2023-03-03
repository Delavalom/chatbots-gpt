import { Redis } from "ioredis";
import invariant from "tiny-invariant";

const redisURL = process.env.UPSTASH_REDIS_URL;

invariant(redisURL, "Couldn't read the redis url enviroment variable");

const redis = new Redis(redisURL);

export async function redisMethods() {
  async function get(id: number | string) {
    let key = id.toString();
    try {
      const payload = await redis.get(key);
      if (!payload) return payload as null | undefined
      return JSON.parse(payload) as Messages;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      console.log(error);
    }
  }

  async function set<T extends Messages | string>(
    id: string | number,
    messages: T
  ) {
    let key = id.toString();
    try {
      return redis.set(key, JSON.stringify(messages));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      console.log(error);
    }
  }

  return {
    get,
    set,
  };
}
