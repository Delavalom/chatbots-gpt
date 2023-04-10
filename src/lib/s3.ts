import { envVariables } from "~/env.js";
import { S3Client } from "@aws-sdk/client-s3";


const REGION = envVariables()?.REGION;

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID!,
  },
});
