import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Процент запросов для трейсинга
  tracesSampleRate: 1.0,

  // Включаем только в production
  enabled: process.env.NODE_ENV === "production",

  // Игнорируем некоторые ошибки
  ignoreErrors: ["NEXT_NOT_FOUND", "NEXT_REDIRECT"],
});
