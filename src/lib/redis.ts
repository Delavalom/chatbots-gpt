import { Messages } from "~/lib/openai.js";
// use this import if you are running a nodejs v17 and earlier, for higher versions import without the with-fetch
import { Redis } from "@upstash/redis/with-fetch";

const url = process.env.UPSTASH_URL;
const token = process.env.UPSTASH_TOKEN;

export const redis = new Redis({
  url,
  token,
});

export async function redisMethods() {
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