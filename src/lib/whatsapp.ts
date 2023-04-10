import ws from "whatsapp-web.js";

export const whatsapp = new ws.Client({
  authStrategy: new ws.LocalAuth()
});

// import fs from "fs";
// import {
  //   DeleteObjectCommand,
  //   GetObjectCommand,
  //   ListObjectsCommand,
  //   PutObjectCommand,
  //   S3Client,
  //   CreateBucketCommand,
  // } from "@aws-sdk/client-s3";

  // const Bucket = process.env.BUCKET;
  
// function createStore(s3Client: S3Client) {
//   return {
//     sessionExists: async (options: { session: string }) => {
//       try {
//         const multiDeviceCollection = await s3Client.send(
//           new ListObjectsCommand({ Bucket })
//         );
//         const hasExistingSession = multiDeviceCollection.Contents?.some(
//           (obj) => obj.Key === `whatsapp-${options.session}`
//         );

//         return !!hasExistingSession;
//       } catch (error) {
//         if (error instanceof Error) {
//           console.log(error.message);
//         }
//         console.log(error);
//         return false;
//       }
//     },
//     save: async function (options: { session: string }) {
//       try {
//         const Body = fs.readFileSync(`${options.session}.zip`, "utf-8");
//         await s3Client.send(
//           new PutObjectCommand({
//             Bucket,
//             Key: `whatsapp-${options.session}`,
//             Body,
//           })
//         );

//         console.log("object created");

//         this.deletePrevious();
//       } catch (error) {
//         if (error instanceof Error) {
//           console.log(error.message);
//         }
//         console.log(error);
//       }
//     },
//     extract: async (options: { session: string; path: string }) => {
//       try {
//         const document = await s3Client.send(
//           new GetObjectCommand({ Bucket, Key: `whatsapp-${options.session}` })
//         );
//         const bodyToString = await document.Body?.transformToString();

//         fs.writeFileSync(options.path, bodyToString!);

//         console.log("object extracted");
//       } catch (error) {
//         if (error instanceof Error) {
//           console.log(error.message);
//         }
//         console.log(error);
//       }
//     },
//     delete: async (options: { session: string }) => {
//       try {
//         await s3Client.send(
//           new DeleteObjectCommand({
//             Bucket,
//             Key: `whatsapp-${options.session}`,
//           })
//         );
//         console.log("object deleted");
//       } catch (error) {
//         if (error instanceof Error) {
//           console.log(error.message);
//         }
//         console.log(error);
//       }
//     },
//     deletePrevious: async function () {
//       try {
//         const documents = await s3Client.send(
//           new ListObjectsCommand({ Bucket })
//         );
//         if (documents.Contents && documents.Contents?.length > 1) {
//           console.log("document content exits & is greater than 1");

//           const oldSession = documents.Contents?.reduce((a, b) => {
//             if (a.LastModified && b.LastModified) {
//               console.log("a & b lastmodified date exists");
//               if (a.LastModified > b.LastModified) {
//                 console.log("a lastmodified is bigger than b");
//                 return a;
//               }
//             }
//             return b;
//           });
//           await this.delete({ session: `whatsapp-${oldSession.Key}.zip` });
//           console.log("previous object deleted");
//         }
//         console.log("documents.contents doesn't ", documents.Contents, documents.Contents?.length)
//       } catch (error) {
//         if (error instanceof Error) {
//           console.log(error.message);
//         }
//         console.log(error);
//       }
//     },
//   };
// }
