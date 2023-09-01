import type { OpenAI } from "openai";

export type Messages = OpenAI.Chat.CompletionCreateParamsNonStreaming["messages"];

export async function generate(
  openai: OpenAI,
  messages: Messages
): Promise<{ message: string }> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });
    const payload = chatCompletion.choices.pop();
    if (!payload || !payload.message.content) {
      return { message: "recieve a response from the ai but comes empty" };
    }
    console.log("Generation Successfull")
    return { message: payload.message.content };
  } catch (error) {
    console.log("Generation Failed")
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "recieve a error from the ai" };
  }
}

export type Generate = typeof generate