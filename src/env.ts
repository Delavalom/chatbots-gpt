import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
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

export const processEnv = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  UPSTASH_URL: process.env.UPSTASH_URL,
  UPSTASH_TOKEN: process.env.UPSTASH_TOKEN,
  BUCKET: process.env.BUCKET,
  REGION: process.env.REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY_ID: process.env.AWS_SECRET_ACCESS_KEY_ID,
};

const envVariables = () => {
  const parsed = envSchema.safeParse(processEnv);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  return new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      return target[prop as keyof typeof target];
    },
  });
};

export { envVariables };
