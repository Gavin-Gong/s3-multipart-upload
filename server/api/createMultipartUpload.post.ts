import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3" // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html


import { s3, config } from "~/utils/s3"
export default defineEventHandler(async (event) => {
  const data: {
    key: string,
    params: Record<string, any>
  } = await readBody(event)

  const params = {
    Bucket: config.bucket,
    Key: data.key,
  };
  const { UploadId } = await s3.send(new CreateMultipartUploadCommand(params))
  console.log('createMultipartUpload', params)
  return {
    UploadId
  }
})