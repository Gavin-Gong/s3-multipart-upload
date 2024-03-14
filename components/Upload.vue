<template>
  <div class="max-w-1280px m-auto pt-10 flex">
    <div>
      <input ref="fileRef" type="file">
      <div class="flex mt-4">
        <div class="mr-4">
          分片大小(MB)
          <NInputNumber :min="5" :max="9999" v-model:value="chunkMbSize" />
        </div>
        <div>
          并行上传数量
          <NInputNumber :min="1" :max="10" v-model:value="parallelCount" />
        </div>
      </div>
      <NButton @click="handleUpload" class="mt-4">上传文件</NButton>
    </div>
    <div class="font-mono ml-8 max-h-60vh overflow-scroll">
      <div v-for="log in logList">
        {{ log.content }}
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { NButton, NInputNumber, useMessage } from "naive-ui"
import axios from "axios"
import { chunk } from "lodash-es"
import dayjs from "dayjs"
const message = useMessage()
const fileRef = ref<HTMLInputElement | null>(null)

const chunkMbSize = ref(5)
const parallelCount = ref(1)
const logList = ref<{ content: string, type?: string }[]>([])
const log = (text: string, type?: string) => {
  const content = `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]: ${text}`
  logList.value.push({
    content,
    type
  })
}

const handleUpload = async () => {
  const file = fileRef.value?.files?.[0]!
  if (!file) {
    message.error('请选择文件')
    return
  }
  const name = file.name
  const size = file.size
  const key = name
  const startTime = Date.now()
  const createRes = await $fetch<any>('/api/createMultipartUpload', {
    method: 'post',
    body: { key: name }
  })
  const chunkSize = chunkMbSize.value * 1024 * 1024
  const uploadId = createRes.UploadId
  const chunkList = []
  // 对文件进行分片
  const chunkCount = Math.ceil(file.size / chunkSize)
  log(`创建上传任务, 分片数量 ${chunkCount}`, 'keep')
  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize
    const end = Math.min(file.size, start + chunkSize)
    chunkList.push({
      chunk: file.slice(start, end),
      partNumber: i + 1
    })
  }


  const taskChunks = chunk(chunkList, parallelCount.value)
  const partList = []

  for (let i = 0; i < taskChunks.length; i++) {
    const taskChunk = taskChunks[i]
    const taskList = taskChunk.map(({ chunk, partNumber }) => {
      log(`分片 ${partNumber} 开始上传`)
      const fn = () => $fetch('/api/presignedURL', {
        method: 'post',
        body: {
          type: "UploadPartCommand",
          key,
          params: {
            PartNumber: partNumber,
            UploadId: uploadId
          }
        }
      }).then((data: any) => {
        return axios.put(data.presignedUrl, chunk).then((res) => {
          log(`分片 ${partNumber}上传完成`)
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

  const completeUploadRes = await $fetch<any>('/api/completeMultipartUpload', {
    method: "post",
    body: {
      key: key,
      params: {
        UploadId: uploadId,
        MultipartUpload: {
          Parts: partList
        }
      }
    }
  })
  logList.value = logList.value.filter(log => log.type === 'keep')
  log(`上传任务已经完成，返回文件地址：${completeUploadRes.Location}`, 'keep')

  const seconds = (Date.now() - startTime) / 1000
  const timeStr = seconds > 60 ? `${(Math.floor(seconds / 60))}分钟 ${Math.round(seconds % 60)} 秒` : `${seconds.toFixed(0)}秒`
  log(`任务分析：[${name}] 文件大小 ${(size / 1024 / 1024).toFixed(2)}MB, 并行上传数量 ${parallelCount.value}, 分片大小${chunkMbSize.value} MB, 总耗时 ${timeStr}, 平均速度 ${(size / seconds / 1024 / 1024).toFixed(2)} MB/s`, 'keep')
  message.success('上传成功')
}

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}
</style>