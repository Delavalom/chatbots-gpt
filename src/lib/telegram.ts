import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import invariant from "tiny-invariant";

config()
const token = process.env.TELEGRAM_BOT_TOKEN;
invariant(token, "Couldn't read the telegram token enviroment variable");

export const bot = new TelegramBot(token, { polling: true });