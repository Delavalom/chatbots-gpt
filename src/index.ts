import { handleTelegramMessage, telegram } from "~/lib/telegram.js";
import { handleWhatsappMessage, initializeWhatsapp, whatsapp } from "~/lib/whatsapp.js";
import { redisMethods } from "./lib/redis.js";
import { generate } from "./lib/openai.js";

telegram.on("message", (msg) => handleTelegramMessage(msg, redisMethods, generate))

telegram.on("error", (err) => console.log(err.message));

initializeWhatsapp()

whatsapp.on("message", (msg) => handleWhatsappMessage(msg, redisMethods, generate))