import type { Messages } from "~/lib/openai.js";
import type { Redis } from "@upstash/redis";

export async function redisMethods(redis: Redis) {
  async function get(id: number | string) {
    let key = id.toString();
    try {
      const payload = await redis.get<Messages>(key);
      return payload;
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
      return redis.set(key, JSON.stringify(messages), { ex: 21600 }); // data expires in 6 hours
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

export type RedisMethods = typeof redisMethods