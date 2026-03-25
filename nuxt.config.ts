// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "pinia-plugin-persistedstate/nuxt"],
  css: ["leaflet/dist/leaflet.css"],
  app: {
    head: {
      script: [
        {
          src: "/_vercel/insights/script.js",
          defer: true,
        },
      ],
    },
  },
});
