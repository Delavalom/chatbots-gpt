import { Messages, generate } from "./lib/openai.js";
import { redisMethods } from "./lib/redis.js";
import { bot } from "./lib/telegram.js";

bot.on("message", async (msg) => {
  if (!msg.text) return;
  const { id } = msg.chat;

  const { get, set } = await redisMethods();

  const messages = await get(id);

  if (!messages) {
    const initialGeneration = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: msg.text },
    ] satisfies Messages
    const generation = await generate(initialGeneration);
    bot.sendMessage(id, generation.message);
    set(id, [
      ...initialGeneration,
      { role: "assistant", content: generation.message },
    ]);
    return;
  }

  const nextMessages = [...messages, {role: "user", content: msg.text}] satisfies Messages
  const generation = await generate(nextMessages);

  bot.sendMessage(id, generation.message);
  set(id, [
    ...nextMessages,
    { role: "assistant", content: generation.message },
  ]);
});

bot.on("error", (err) => console.log(err.message));
