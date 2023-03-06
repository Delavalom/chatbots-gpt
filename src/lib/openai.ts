import {
  type CreateChatCompletionRequest,
  Configuration,
  OpenAIApi,
} from "openai";
import invariant from "tiny-invariant";
import { config } from "dotenv";

export type Messages = CreateChatCompletionRequest["messages"]

config();
const apiKey = process.env.OPENAI_API_KEY;

invariant(apiKey, "Couldn't read the openai apiKey url enviroment variable");

const configuration = new Configuration({
  apiKey,
});
const openai = new OpenAIApi(configuration);

export async function generate(messages: Messages): Promise<{ message: string }> {
  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });
    const payload = chatCompletion.data.choices.pop();
    if (!payload?.message) {
      return { message: "recieve a response from the ai but comes empty" };
    }
    return { message: payload.message.content };
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "recieve a error from the ai" };
  }
}
