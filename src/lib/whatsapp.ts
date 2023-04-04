import ws from "whatsapp-web.js";
import fs from "fs";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { s3Client } from "./s3.js";
import { config } from "dotenv";


config()

const Bucket = process.env.BUCKET;

export const whatsapp = new ws.Client({
  authStrategy: new ws.RemoteAuth({
    store: createStore(s3Client),
    backupSyncIntervalMs: 300000,
  }),
});

function createStore(s3Client: S3Client) {
  return {
    sessionExists: async (options: { session: string }) => {
      const multiDeviceCollection = await s3Client.send(
        new ListObjectsCommand({ Bucket })
      );
      const hasExistingSession = multiDeviceCollection.Contents?.some(
        (obj) => obj.Key === `whatsapp-${options.session}`
      );
      return !!hasExistingSession;
    },
    save: async (options: { session: string }) => {
      const Body = fs.readFileSync(`${options.session}.zip`, "utf-8");
      await s3Client.send(
        new PutObjectCommand({
          Bucket,
          Key: `whatsapp-${options.session}`,
          Body,
        })
      );
    },
    extract: async (options: { session: string; path: string }) => {
      const document = await s3Client.send(
        new GetObjectCommand({ Bucket, Key: `whatsapp-${options.session}` })
      );
      const bodyToString = await document.Body?.transformToString();

      fs.writeFileSync(options.path, bodyToString!);
    },
    delete: async (options: { session: string }) => {
      await s3Client.send(
        new DeleteObjectCommand({ Bucket, Key: `whatsapp-${options.session}` })
      );
    },
  };
}
