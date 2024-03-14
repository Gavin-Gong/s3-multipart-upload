<template>
  <div>
    <input ref="file" type="file">
    <NButton @click="handleUpload">upload</NButton>
  </div>
</template>


<script lang="ts" setup>
import { NButton } from "naive-ui"
const fileRef = ref<HTMLInputElement | null>(null)

const submit = async () => {
  const { body } = await $fetch<any>('/api/createMultipartUpload', {
    method: 'post',
    body: { key: 1 }
  })

  console.log(body)
}

const handleUpload = () => {
  const file = fileRef.value?.files?.[0]
  submit()
  if (file) {
    console.log(file)
  }
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