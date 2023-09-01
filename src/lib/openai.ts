import {
  OpenAI
} from "openai";

export type Messages = OpenAI.Chat.CompletionCreateParamsNonStreaming["messages"];

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({apiKey});

export async function generate(
  messages: Messages
): Promise<{ message: string }> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
    });
    const payload = chatCompletion.choices.pop();
    if (!payload || !payload.message.content) {
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