import TelegramBot from "node-telegram-bot-api";
import ws from "whatsapp-web.js";
import { Messages, generate } from "./lib/openai.js";
import { redisMethods } from "./lib/redis.js";
import { handleTelegramMessage } from "./lib/telegram.js";
import { handleWhatsappMessage } from "./lib/whatsapp.js";
// use import @upstash/redis/with-fetch if you are running a nodejs v17 or earlier
import { Redis } from "@upstash/redis";
import OpenAI from "openai";
import qrcode from "qrcode-terminal";
import { envVariables } from "./env.js";
import { createStore } from "./lib/s3.js";

envVariables.parse(process.env);

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const apiKey = process.env.OPENAI_API_KEY;
const url = process.env.UPSTASH_URL;
const upstashToken = process.env.UPSTASH_TOKEN;

const openai = new OpenAI({ apiKey });
export const redis = new Redis({
  url,
  token: upstashToken,
});
const telegram = new TelegramBot(telegramToken, { polling: true });
const whatsapp = new ws.Client({
  puppeteer: {
    args: ["--no-sandbox"],
  },
  authStrategy: new ws.RemoteAuth({
    store: createStore(),
    backupSyncIntervalMs: 300000,
  }),
});

telegram.on("message", (msg) =>
  handleTelegramMessage(openai, redis, telegram, msg, redisMethods, generate)
);

telegram.on("error", (err) => console.log(err.message));

whatsapp.initialize();

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});



whatsapp.on("remote_session_saved", () => {
  console.log("Remote Session stored!");
});

whatsapp.on("ready", () => {
  console.log("Whatsapp client is ready!");
});

whatsapp.on("auth_failure", (message) => console.log(message));
whatsapp.on("message", async (msg) => {
  console.log("Got a message");
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
});

