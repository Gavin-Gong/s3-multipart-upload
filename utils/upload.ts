import axios from "axios"
import { readFileSync } from 'fs'
import { resolve } from "path"
import { Blob } from "buffer"
axios.defaults.baseURL = "http://localhost:3000"
import { chunk } from "lodash-es"
import { retry } from "./retry"
async function upload() {
  const chunkSize = 1024 * 1024 * 15
  const concurrency = 3
  const filePath = resolve(__dirname, '../data/往生-208.mp4')
  const key = Buffer.from(filePath).toString('base64')
  console.log('start upload', new Date())
  try {
    const fileContext = readFileSync(filePath)
    console.log('file size', fileContext.length / 1024 / 1024, 'MB')
    const { data: { UploadId } } = await axios.post('/createMultipartUpload', {
      key,
    })

    const chunkList = []
    const file = new Blob([fileContext])
    const chunkCount = Math.ceil(file.size / chunkSize)

    for (let i = 0; i < chunkCount; i++) {
      const start = i * chunkSize
      const end = Math.min(file.size, start + chunkSize)
      chunkList.push({
        chunk: file.slice(start, end),
        partNumber: i + 1
      })
    }

    console.log('chunk count', chunkList.length)
    const taskChunks = chunk(chunkList, concurrency)
    const partList = []

    for (let i = 0; i < taskChunks.length; i++) {
      const taskChunk = taskChunks[i]
      const taskList = taskChunk.map(({ chunk, partNumber }) => {
        console.log('start upload part', partNumber, new Date())
        const fn = () => axios.post('/presignedUrl', {
          type: "UploadPartCommand",
          key,
          params: {
            PartNumber: partNumber,
            UploadId
          }
        }).then(res => {
          return axios.put(res.data.presignedUrl, chunk).then((res) => {
            console.log('end upload part', partNumber, new Date())
            return res
          })
        })
        return retry(fn)
      })
      const res = await Promise.all(taskList)
      partList.push(...res.map((res, index) => {
        return {
          PartNumber: taskChunk[index].partNumber,
          ETag: res.headers.etag
        }
      }))
    }
    const completeUploadRes = await axios.post('/completeUpload', {
      key: key,
      params: {
        UploadId,
        MultipartUpload: {
          Parts: partList
        }
      }
    })
    console.log('complete upload', new Date())
    console.log('xx', completeUploadRes.data)
  } catch (error: any) {
    console.log(error)
  }
}

upload()