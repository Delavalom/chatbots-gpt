import type TelegramBot from "node-telegram-bot-api";
import type { RedisMethods } from "./redis.js";
import type { Generate, Messages } from "./openai.js";

export async function handleTelegramMessage(
  telegram: TelegramBot,
  msg: TelegramBot.Message,
  redisMethods: RedisMethods,
  generate: Generate
) {
  if (!msg.text) return;
  const { id } = msg.chat;

  const { get, set } = await redisMethods();

  const messages = await get(id);

  if (!messages) {
    const initialGeneration = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: msg.text },
    ] satisfies Messages;
    const generation = await generate(initialGeneration);
    telegram.sendMessage(id, generation.message);
    set(id, [
      ...initialGeneration,
      { role: "assistant", content: generation.message },
    ]);
    return;
  }

  messages.push({ role: "user", content: msg.text });
  const generation = await generate(messages);

  telegram.sendMessage(id, generation.message);

  messages.push({ role: "assistant", content: generation.message });
  set(id, messages);
}
