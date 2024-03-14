import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { config, s3 } from "~/utils/s3";

export default defineEventHandler(async (event) => {
  const { key, params: reqParams } = await readBody(event)
  const params = {
    Bucket: config.bucket,
    Key: key,
    ...reqParams
  };
  const data = await s3.send(new CompleteMultipartUploadCommand(params))
  return data
})