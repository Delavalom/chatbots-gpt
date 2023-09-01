import { handleTelegramMessage } from "./lib/telegram.js";
import { handleWhatsappMessage, initializeWhatsapp } from "./lib/whatsapp.js";
import { redisMethods } from "./lib/redis.js";
import { generate } from "./lib/openai.js";
import TelegramBot from "node-telegram-bot-api";
import ws from "whatsapp-web.js";
import { envVariables } from "./env.js";
import { config } from "dotenv";

config();

function main() {
    envVariables.parse(process.env)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const telegram = new TelegramBot(token, { polling: true });
    const whatsapp = new ws.Client({
        authStrategy: new ws.LocalAuth(),
      });

    telegram.on("message", (msg) => handleTelegramMessage(telegram, msg, redisMethods, generate))
    
    telegram.on("error", (err) => console.log(err.message));
    
    initializeWhatsapp(whatsapp)
    
    whatsapp.on("message", (msg) => handleWhatsappMessage(msg, redisMethods, generate))
}

main()