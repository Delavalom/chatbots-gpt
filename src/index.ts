import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import invariant from "tiny-invariant";
import { Configuration, OpenAIApi } from "openai";

config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const token = process.env.TELEGRAM_BOT_TOKEN
const openai = new OpenAIApi(configuration)

invariant(token, "Couldn't read the token the enviroment variable")

const bot = new TelegramBot(token, {polling: true});

bot.on("message", async (msg) => {
    const baseCompletion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${msg.text}.\n`,
        temperature: 0.8,
        max_tokens: 250,
    })

    console.log(baseCompletion.data.usage?.prompt_tokens)
    const basePromptOuput = baseCompletion.data.choices.pop()

    const chatId = msg.chat.id

    invariant(basePromptOuput?.text, "Couldn't recieve something from open ai")
    bot.sendMessage(chatId, basePromptOuput?.text)
})