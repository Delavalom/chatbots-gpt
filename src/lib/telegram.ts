import type TelegramBot from "node-telegram-bot-api";
import type { RedisMethods } from "./redis.js";
import type { Generate, Messages } from "./openai.js";
import type { Redis } from "@upstash/redis";
import type OpenAI from "openai";

export async function handleTelegramMessage(
  openai: OpenAI,
  redis: Redis,
  telegram: TelegramBot,
  msg: TelegramBot.Message,
  redisMethods: RedisMethods,
  generate: Generate
) {
  if (!msg.text) return;
  console.log("Got a message")
  const { id } = msg.chat;

  const { get, set } = await redisMethods(redis);

  const messages = await get(id);

  if (!messages) {
    const initialGeneration = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: msg.text },
    ] satisfies Messages;
    const generation = await generate(openai, initialGeneration);
    telegram.sendMessage(id, generation.message);
    set(id, [
      ...initialGeneration,
      { role: "assistant", content: generation.message },
    ]);
    return;
  }

  messages.push({ role: "user", content: msg.text });
  const generation = await generate(openai, messages);

  telegram.sendMessage(id, generation.message);

  messages.push({ role: "assistant", content: generation.message });
  set(id, messages);
}
