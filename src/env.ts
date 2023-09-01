import { z } from "zod";

export const envVariables = z.object({
  TELEGRAM_BOT_TOKEN: z
  .string()
  .min(1, { message: "The telegram bot token hasn't been set" }),
  OPENAI_API_KEY: z
  .string()
  .min(1, { message: "The openai api key hasn't been set" }),
  UPSTASH_URL: z
  .string()
  .min(1, { message: "The upstash url hasn't been set" }),
  UPSTASH_TOKEN: z
    .string()
    .min(1, { message: "The upstash token hasn't been set" }),
  BUCKET: z.string().min(1, { message: "" }).optional(),
  REGION: z.string().min(1, { message: "" }).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1, { message: "" }).optional(),
  AWS_SECRET_ACCESS_KEY_ID: z.string().min(1, { message: "" }).optional(),
});

envVariables.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
