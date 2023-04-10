import { envVariables } from "@/env.js";
import TelegramBot from "node-telegram-bot-api";

const token = envVariables().TELEGRAM_BOT_TOKEN

export const telegram = new TelegramBot(token, { polling: true });