import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import invariant from "tiny-invariant";
import { Configuration, OpenAIApi } from "openai";
import { Redis } from "ioredis";

config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const token = process.env.TELEGRAM_BOT_TOKEN;

type Messages = Parameters<typeof openai.createChatCompletion>[0]["messages"];

const redisURL = process.env.UPSTASH_REDIS_URL;

invariant(token, "Couldn't read the telegram token enviroment variable");
invariant(redisURL, "Couldn't read the redis url enviroment variable");

const redis = new Redis(redisURL);
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const { id } = msg.chat;

  let messages =
    ((await redis.get(id.toFixed(), (err, result) => {
      if (err) {
        return "Must be an error with the data";
      }
      if (typeof result === "string") {
        return JSON.parse(result);
      }
      return result;
    })) as Messages | null | undefined) ??
    ([{ role: "user", content: `${msg.text}` }] as Messages);

  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });
    const chatOutput = chatCompletion.data.choices.pop();

    if (!chatOutput?.message?.content) {
      return bot.sendMessage(id, "please try again, AI couldn't send the data");
    }

    bot.sendMessage(id, chatOutput.message.content);

    if (!messages) {
      messages = [];
    }
    messages.push(chatOutput.message);
    redis.set(id.toFixed(), JSON.stringify(messages));
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
    }
    // const normalCompletion = await openai.createCompletion({
    //   model: "text-davinci-003",
    //   prompt: `${msg.text}: \n`,
    //   max_tokens: 2000,
    //   temperature: 0.8,
    // });
    // const normalOutput = normalCompletion.data.choices.pop();
    // console.log(normalCompletion)
    // bot.sendMessage(id, `${normalOutput?.text}`);
  }
});

bot.on("error", (err) => console.log(err.message));
