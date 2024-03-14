// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    s3: {
      region: process.env.REGION,
      ak: process.env.AK,
      as: process.env.AS,
      bucket: process.env.BUCKET,
    }
  },
  modules: [
    '@unocss/nuxt',
  ],
  ssr: false
})
