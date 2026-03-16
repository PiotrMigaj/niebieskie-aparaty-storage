// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', 'nuxt-auth-utils', '@nuxt/fonts'],

  colorMode: {
    preference: 'light'
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.BUCKET_NAME,
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    dynamoTableName: process.env.DYNAMODB_TABLE_NAME,
    allowableEmails: process.env.ALLOWABLE_EMAILS,
    session: {
      password: process.env.NUXT_SESSION_PASSWORD
    }
  },

  icon: {
    provider: 'iconify'
  }
})
