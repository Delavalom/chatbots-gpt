import { handleTelegramMessage } from "./lib/telegram.js";
import { handleWhatsappMessage, initializeWhatsapp } from "./lib/whatsapp.js";
import { redisMethods } from "./lib/redis.js";
import { generate } from "./lib/openai.js";
import TelegramBot from "node-telegram-bot-api";
import ws from "whatsapp-web.js";
// use import @upstash/redis/with-fetch if you are running a nodejs v17 or earlier
import { Redis } from "@upstash/redis";
import OpenAI from "openai";
import { envVariables } from "./env.js";

envVariables.parse(process.env)

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
  authStrategy: new ws.LocalAuth(),
});


telegram.on("message", (msg) => handleTelegramMessage(openai, redis, telegram, msg, redisMethods, generate))

telegram.on("error", (err) => console.log(err.message));

initializeWhatsapp(whatsapp)

whatsapp.on("message", (msg) => handleWhatsappMessage(openai, redis, msg, redisMethods, generate))