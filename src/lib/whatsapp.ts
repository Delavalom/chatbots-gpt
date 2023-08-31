import type ws from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import WAWebJS from "whatsapp-web.js";
import { RedisMethods } from "./redis.js";
import { Generate, Messages } from "./openai.js";

export function initializeWhatsapp(whatsapp: ws.Client) {
  whatsapp.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  whatsapp.on("remote_session_saved", () => {
    console.log("Remote Session stored!");
  });

  whatsapp.on("ready", () => {
    console.log("Whatsapp client is ready!");
  });

  whatsapp.initialize();

  whatsapp.on("auth_failure", (message) => console.log(message))
}

export async function handleWhatsappMessage(
  msg: WAWebJS.Message,
  redisMethods: RedisMethods,
  generate: Generate
) {
  if (!msg.body.toLowerCase().startsWith("b:")) return;

  const { id } = msg.id;

  const { get, set } = await redisMethods();

  const messages = await get(id);

  if (!messages) {
    const initialGeneration = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: msg.body.replace("bot:", "") },
    ] satisfies Messages;
    const generation = await generate(initialGeneration);
    msg.reply(generation.message);
    set(id, [
      ...initialGeneration,
      { role: "assistant", content: generation.message },
    ]);
    return;
  }

  messages.push({ role: "user", content: msg.body.replace("bot:", "") });
  const generation = await generate(messages);

  msg.reply(generation.message);

  messages.push({ role: "assistant", content: generation.message });
  set(id, messages);
}
