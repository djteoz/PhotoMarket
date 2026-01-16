import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Процент сессий для записи (1.0 = 100%)
  tracesSampleRate: 1.0,

  // Записываем replay ошибок
  replaysSessionSampleRate: 0.1, // 10% сессий
  replaysOnErrorSampleRate: 1.0, // 100% при ошибке

  // Включаем только в production
  enabled: process.env.NODE_ENV === "production",

  // Интеграции
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Игнорируем некоторые ошибки
  ignoreErrors: [
    // Ошибки сети
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // Clerk ошибки (не критичны)
    "Clerk: auth()",
  ],
});
