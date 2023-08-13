import { envVariables } from "~/env.js";
import {
  Configuration,
  OpenAIApi,
  type CreateChatCompletionRequest,
} from "openai";

export type Messages = CreateChatCompletionRequest["messages"];

const apiKey = envVariables().OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey,
});
const openai = new OpenAIApi(configuration);

export async function generate(
  messages: Messages
): Promise<{ message: string }> {
  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-4",
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

export type Generate = typeof generate