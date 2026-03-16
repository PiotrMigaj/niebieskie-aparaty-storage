import { defineAppConfig } from "nuxt/app";

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'neutral',
      neutral: 'neutral'
    },
    skeleton: {
      base: 'animate-pulse rounded-md bg-neutral-200'
    }
  }
})
