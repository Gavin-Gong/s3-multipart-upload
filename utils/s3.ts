import { PutObjectCommand, S3Client, CreateMultipartUploadCommand, CompleteMultipartUploadCommand, UploadPartCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

const runtimeConfig = useRuntimeConfig()
export const config = runtimeConfig.s3

export const s3 = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.ak,
    secretAccessKey: config.as
  },
});
