import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
  S3,
} from "@aws-sdk/client-s3";
import fs from "fs";

type Options = {
  session: string;
  path?: string;
};

export function createStore() {
  const Bucket = process.env.BUCKET;
  const region = process.env.REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!Bucket || !region || !accessKeyId || !secretAccessKey)
    throw new Error("BUCKET enviroment variable is undefined");

  const s3Client = new S3({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return {
    sessionExists: async (_options: Options) => {
      try {
        console.log("trying to get the object")
        // const { Body } = await s3Client.getObject({
        //     Bucket,
        //     Key: `whatsapp-${options.session}`,
        // });
         return false;
        
        // console.log("object got it")
        // return true;
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        console.log(error);
        return false;
      }
    },
    save: async function (options: Options) {
      try {
        const Body = fs.readFileSync(`${options.session}.zip`, "utf-8");
        const output = await s3Client.putObject({
          Bucket,
          Key: `whatsapp-${options.session}`,
          Body,
        });

        console.log("object created");

      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        console.log(error);
      }
    },
    extract: async (options: Options) => {
      try {
        const document = await s3Client.send(
          new GetObjectCommand({ Bucket, Key: `whatsapp-${options.session}` })
        );
        const bodyToString = await document.Body?.transformToString();

        fs.writeFileSync(options.path ?? "", bodyToString!);

        console.log("object extracted");
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        console.log(error);
      }
    },
    delete: async (options: { session: string }) => {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket,
            Key: `whatsapp-${options.session}`,
          })
        );
        console.log("object deleted");
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        console.log(error);
      }
    },
    deletePrevious: async function () {
      try {
        const documents = await s3Client.send(
          new ListObjectsCommand({ Bucket })
        );
        if (documents.Contents && documents.Contents?.length > 1) {
          console.log("document content exits & is greater than 1");

          const oldSession = documents.Contents?.reduce((a, b) => {
            if (a.LastModified && b.LastModified) {
              console.log("a & b lastmodified date exists");
              if (a.LastModified > b.LastModified) {
                console.log("a lastmodified is bigger than b");
                return a;
              }
            }
            return b;
          });
          await this.delete({ session: `whatsapp-${oldSession.Key}.zip` });
          console.log("previous object deleted");
        }
        console.log(
          "documents.contents doesn't ",
          documents.Contents,
          documents.Contents?.length
        );
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        console.log(error);
      }
    },
  };
}
