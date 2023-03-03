import { generate } from "lib/openai.js";
import { redisMethods } from "lib/redis.js";
import { bot } from "lib/telegram.js";

bot.on("message", async (msg) => {
  if (!msg.text) return;
  const { id } = msg.chat;

  const { get, set } = await redisMethods();

  const messages = await get(id);

  if (!messages) {
    const generation = await generate([{ role: "user", content: msg.text }]);
    bot.sendMessage(id, generation.message);
    set(id, [{ role: "user", content: msg.text }]);
    return;
  }

  const generation = await generate(messages);
  bot.sendMessage(id, generation.message);
});

bot.on("error", (err) => console.log(err.message));
