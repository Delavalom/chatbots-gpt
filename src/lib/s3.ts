import { S3Client } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

const REGION = process.env.REGION;

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID!,
  },
});
