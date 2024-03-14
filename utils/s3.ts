import { S3Client } from "@aws-sdk/client-s3";

const runtimeConfig = useRuntimeConfig()
export const config = runtimeConfig.s3

export const s3 = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.ak,
    secretAccessKey: config.as
  },
});
