
import WAWebJS from "whatsapp-web.js";
import { RedisMethods } from "./redis.js";
import { Generate, Messages } from "./openai.js";
import type { Redis } from "@upstash/redis";
import type OpenAI from "openai";


export async function handleWhatsappMessage(
  openai: OpenAI,
  redis: Redis,
  msg: WAWebJS.Message,
  redisMethods: RedisMethods,
  generate: Generate
) {
  console.log("Got a message")
  if (!msg.body.toLowerCase().startsWith("b:")) return;

  const { id } = msg.id;

  const { get, set } = await redisMethods(redis);

  const messages = await get(id);

  if (!messages) {
    const initialGeneration = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: msg.body.replace("bot:", "") },
    ] satisfies Messages;
    const generation = await generate(openai, initialGeneration);
    msg.reply(generation.message);
    set(id, [
      ...initialGeneration,
      { role: "assistant", content: generation.message },
    ]);
    return;
  }

  messages.push({ role: "user", content: msg.body.replace("bot:", "") });
  const generation = await generate(openai, messages);

  msg.reply(generation.message);

  messages.push({ role: "assistant", content: generation.message });
  set(id, messages);
}
