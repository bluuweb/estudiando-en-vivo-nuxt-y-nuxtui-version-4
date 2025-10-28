// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "nuxt-auth-utils", "@prisma/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    nodemailer: {
      smtpHost: process.env.NUXT_SMTP_HOST || "sandbox.smtp.mailtrap.io",
      smtpPort: process.env.NUXT_SMTP_PORT || 2525,
      auth: {
        smtpUser: process.env.NUXT_SMTP_USER || "",
        smtpPass: process.env.NUXT_SMTP_PASS || "",
      },
    },
    secretJwtKey: "",
    public: {
      baseApi: "",
      appUrl: process.env.APP_URL || "http://localhost:3000",
    },
  },
});
