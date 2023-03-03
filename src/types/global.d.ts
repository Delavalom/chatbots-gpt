export {};

import type { CreateChatCompletionRequest } from "openai";

declare global {
  type Messages = CreateChatCompletionRequest["messages"];
}
