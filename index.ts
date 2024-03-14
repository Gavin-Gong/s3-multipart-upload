import { Hono } from 'hono'
import { config } from './config'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client, CreateMultipartUploadCommand, CompleteMultipartUploadCommand, UploadPartCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { cors } from 'hono/cors'

const app = new Hono()

app.use("/*", cors())

const s3 = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.ak,
    secretAccessKey: config.as
  },
});

app.post('/presignedUrl', async (c) => {
  const data: {
    key: string,
    type: 'UploadPartCommand' | 'PutObjectCommand',
    params: Record<string, any>
  } = await c.req.json()

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
    return c.json({
      presignedUrl
    })
  } else if (type === 'PutObjectCommand') {
    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return c.json({
      presignedUrl
    })
  } else {
    return c.json({
      error: 'Invalid type'
    })
  }
})

app.post('/createMultipartUpload', async (c) => {
  const data: {
    key: string,
    params: Record<string, any>
  } = await c.req.json()

  const params = {
    Bucket: config.bucket,
    Key: data.key,
  };
  const { UploadId } = await s3.send(new CreateMultipartUploadCommand(params))
  return c.json({
    UploadId
  })
})

app.post('/completeUpload', async (c) => {
  const { key, params: reqParams } = await c.req.json() as any
  const params = {
    Bucket: config.bucket,
    Key: key,
    ...reqParams
  };
  const data = await s3.send(new CompleteMultipartUploadCommand(params))
  return c.json(data)
})

app.post('/abortMultipartUpload', async (c) => {
  const { key, UploadId } = await c.req.json() as any
  const params = {
    Bucket: config.bucket,
    Key: key,
    UploadId
  };
  const data = await s3.send(new AbortMultipartUploadCommand(params))
  return c.json(data)
})


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app