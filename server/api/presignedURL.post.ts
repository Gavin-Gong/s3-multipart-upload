import { config, s3 } from "~/utils/s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, UploadPartCommand } from "@aws-sdk/client-s3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data: {
    key: string,
    type: 'UploadPartCommand' | 'PutObjectCommand',
    params: Record<string, any>
  } = await readBody(event)

  const { key, type, params: reqParams } = data
  const params = {
    Bucket: config.bucket,
    Key: key,
    ...reqParams
  };

  if (type === 'UploadPartCommand') {
    // NOTE: PartNumber and UploadId are required
    // @ts-ignore
    const command = new UploadPartCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return {
      presignedUrl
    }
  } else if (type === 'PutObjectCommand') {
    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return {
      presignedUrl
    }
  } else {
    return {
      error: 'Invalid type'
    }
  }
})