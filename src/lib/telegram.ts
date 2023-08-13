import { envVariables } from "~/env.js";
import TelegramBot from "node-telegram-bot-api";
import { RedisMethods } from "./redis.js";
import { Generate, Messages } from "./openai.js";

const token = envVariables().TELEGRAM_BOT_TOKEN;

export const telegram = new TelegramBot(token, { polling: true });

export async function handleTelegramMessage(
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
