# 📸 PhotoMarket — Маркетплейс фотостудий России

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Prod-2496ED?style=for-the-badge&logo=docker)

**Полнофункциональная продакшн-платформа для поиска, сравнения и онлайн-бронирования фотостудий**

[🌐 Демо: photomarket.tech](https://www.photomarket.tech) · [📋 Возможности](#-ключевые-возможности) · [🏗 Архитектура](#-архитектура) · [🚀 Запуск](#-быстрый-старт)

</div>

---

## 📊 О проекте

PhotoMarket — коммерческий маркетплейс, объединяющий владельцев фотостудий и фотографов. Платформа решает реальную бизнес-задачу: упрощает поиск подходящей студии и автоматизирует процесс бронирования с синхронизацией календарей.

Проект спроектирован и разработан **одним разработчиком** от идеи до продакшн-деплоя — включая UI/UX, бэкенд, интеграции с платёжными системами, CI/CD и настройку серверной инфраструктуры.

### Масштаб проекта

| Метрика                    | Значение               |
| -------------------------- | ---------------------- |
| 📄 Файлов исходного кода   | **193** (.ts / .tsx)   |
| 📃 Страниц / API-маршрутов | **36 страниц + 8 API** |
| ⚙️ Серверных экшенов       | **17 модулей**         |
| 🧩 Категорий компонентов   | **22**                 |
| 🗃️ Моделей БД (Prisma)     | **19**                 |
| 🏢 Студий в базе           | **21** (6 городов)     |

---

## ✨ Ключевые возможности

### 🔍 Поиск и каталог

- **Многоуровневая фильтрация** — город, ценовой диапазон, площадь, оборудование, удобства
- **Полнотекстовый поиск** по названию и описанию студий
- **Интерактивная карта** — интеграция с Yandex Maps API, геокодинг адресов
- **SEO-оптимизация** — динамические OG-изображения, sitemap.xml, robots.txt, структурированные данные

### 📅 Система бронирования

- **Онлайн-бронирование залов** с проверкой конфликтов в реальном времени
- **Управление статусами** — PENDING → CONFIRMED → COMPLETED / CANCELLED
- **iCal-синхронизация** — двусторонний импорт/экспорт с Google Calendar и Apple Calendar
- **Cron-задачи** — автоматическая синхронизация и экспирация промо-акций

### 💳 Платежи и монетизация

- **ЮKassa** — полная интеграция: создание платежа, вебхуки, подтверждение
- **Robokassa** — альтернативный провайдер с валидацией подписей
- **Подписки** — PRO (990₽/мес) и Business (2990₽/мес) для владельцев студий
- **Рекламные промо-пакеты** — платное продвижение в топе каталога

### 💬 Коммуникация

- **Встроенный мессенджер** — real-time чат между фотографами и владельцами
- **Форум/сообщество** — категории, посты, комментарии, лайки
- **Email-уведомления** — React Email шаблоны через Resend API
- **Push-уведомления** — система уведомлений в приложении

### 👤 Личный кабинет

- **Дэшборд владельца** — аналитика (просмотры, клики, конверсии), управление залами
- **Профиль пользователя** — избранные студии, история бронирований
- **Система отзывов** — рейтинги, текстовые отзывы, модерация

### 🛡️ Администрирование

- **Панель администратора** — управление пользователями, модерация студий
- **Система безопасности** — блокировка пользователей и IP, rate-limiting
- **Тикеты поддержки** — обработка обращений пользователей

---

## 🏗 Архитектура

### Технологический стек

| Слой                 | Технологии                                                             |
| -------------------- | ---------------------------------------------------------------------- |
| **Frontend**         | Next.js 15.5 (App Router, RSC), React 19, TypeScript 5, Tailwind CSS 4 |
| **UI Kit**           | Shadcn/UI, Radix Primitives, Lucide Icons, React Hook Form + Zod       |
| **Backend**          | Next.js Server Actions, tRPC (React Query), Prisma ORM 5.22            |
| **БД**               | PostgreSQL 16 (Neon — serverless)                                      |
| **Аутентификация**   | Clerk (OAuth, email, session management)                               |
| **Платежи**          | ЮKassa API v3, Robokassa                                               |
| **Email**            | Resend + React Email                                                   |
| **Хранилище файлов** | Uploadthing                                                            |
| **Карты**            | Yandex Maps API + Geocoding                                            |
| **Мониторинг**       | Sentry (error tracking, performance)                                   |
| **Инфраструктура**   | Docker (multi-stage), Nginx, GitHub Actions CI/CD                      |
| **PWA**              | Service Worker, Web App Manifest, offline-страница                     |

### Схема архитектуры

```
┌─────────────────────────────────────────────────────────┐
│                     Клиент (Browser)                    │
│  React 19 · RSC · Tailwind 4 · Shadcn/UI · PWA         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (Nginx reverse proxy)
┌──────────────────────▼──────────────────────────────────┐
│                  Next.js 15 (Node.js)                   │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ App      │  │ Server       │  │ tRPC Router      │  │
│  │ Router   │  │ Actions (17) │  │ (React Query)    │  │
│  │ (36 стр) │  │              │  │                  │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │
│       │               │                   │             │
│  ┌────▼───────────────▼───────────────────▼──────────┐  │
│  │              Prisma ORM (19 моделей)              │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                              │
│  ┌───────────┐  ┌────────▼────┐  ┌───────────────────┐  │
│  │ Clerk     │  │ PostgreSQL  │  │ External APIs     │  │
│  │ (Auth)    │  │ (Neon)      │  │ YooKassa · Resend │  │
│  │ Middleware│  │             │  │ YandexMaps · S3   │  │
│  └───────────┘  └─────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
                    Docker (standalone)
                    GitHub Actions → GHCR → SSH Deploy
```

### Структура проекта

```
photo-studio-market/
├── .github/workflows/      # CI/CD (lint + deploy)
├── prisma/
│   ├── schema.prisma       # 19 моделей, 4 enum
│   ├── seed.ts             # Тестовые данные
│   └── migrations/         # Миграции
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── actions/        # 17 серверных экшенов
│   │   ├── api/            # REST endpoints (health, cron, payments, trpc)
│   │   ├── admin/          # Панель администратора
│   │   ├── catalog/        # Каталог с фильтрами
│   │   ├── studios/[id]/   # Детальная страница студии
│   │   ├── dashboard/      # Личный кабинет + аналитика
│   │   ├── community/      # Форум
│   │   ├── messages/       # Мессенджер
│   │   ├── search/         # Поиск
│   │   ├── pricing/        # Страница тарифов
│   │   └── ...             # 36 страниц всего
│   ├── components/         # 22 категории UI-компонентов
│   │   ├── ui/             # Shadcn/UI (30+ компонентов)
│   │   ├── booking/        # Форма бронирования, календарь
│   │   ├── search/         # Фильтры, результаты
│   │   ├── studios/        # Карточки, галерея
│   │   └── ...
│   ├── lib/                # Бизнес-логика
│   │   ├── payment/        # YooKassa + Robokassa
│   │   ├── ai/             # AI-интеграции
│   │   ├── hooks/          # React-хуки
│   │   └── ...
│   ├── emails/             # React Email шаблоны
│   └── middleware.ts       # Clerk auth middleware
├── Dockerfile              # Multi-stage build (3 стадии)
├── docker-compose.prod.yml # Production compose
├── nginx-photomarket.conf  # Nginx reverse proxy
└── playwright.config.ts    # E2E тесты
```

---

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 20+
- PostgreSQL (или [Neon](https://neon.tech) — бесплатный serverless)
- Аккаунты: [Clerk](https://clerk.com), [Uploadthing](https://uploadthing.com)

### 1. Клонирование и установка

```bash
git clone https://github.com/djteoz/PhotoMarket.git
cd PhotoMarket
npm install
```

### 2. Настройка окружения

Создайте `.env` файл:

```env
# === Обязательные ===
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# === Карты ===
NEXT_PUBLIC_YANDEX_MAP_KEY="..."

# === Опциональные ===
# Платежи
YOOKASSA_SHOP_ID="..."
YOOKASSA_SECRET_KEY="..."

# Email-уведомления
RESEND_API_KEY="re_..."

# Загрузка файлов
UPLOADTHING_TOKEN="..."

# Мониторинг
SENTRY_DSN="..."

# Кеширование
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 3. Инициализация БД

```bash
npx prisma generate
npx prisma db push
npx prisma db seed      # Тестовые данные (опционально)
```

### 4. Запуск

```bash
npm run dev              # Разработка — http://localhost:3000
npm run build && npm start  # Production
```

---

## 🐳 Docker / Production Deploy

### Сборка и запуск

```bash
docker build -t photomarket .
docker compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline

Автоматический деплой при пуше в `main`:

```
Push → GitHub Actions → Docker Build → GHCR → SSH Deploy → docker-compose up
```

### Инфраструктура на сервере

```
Internet → Nginx (SSL/reverse proxy) → Docker (port 3000) → Next.js standalone
                                           ↓
                                    PostgreSQL (Neon, external)
```

---

## 🧪 Тестирование

```bash
npm run test             # Unit-тесты (Vitest)
npm run test:run         # Однократный запуск
npm run test:coverage    # Покрытие кода
npm run test:e2e         # E2E (Playwright)
npm run test:e2e:headed  # E2E с браузером
```

---

## 💰 Бизнес-модель

| Канал                   | Описание                                                   | Статус         |
| ----------------------- | ---------------------------------------------------------- | -------------- |
| 📊 **Подписки**         | PRO (990₽/мес) и Business (2990₽/мес) для владельцев       | ✅ Реализовано |
| 🔝 **Промо-размещение** | Выделение студии в топе каталога (1 день / неделя / месяц) | ✅ Реализовано |
| 💳 **Онлайн-оплата**    | ЮKassa + Robokassa с вебхуками                             | ✅ Реализовано |
| 📅 **Бронирование**     | Система заявок с подтверждением владельцем                 | ✅ Реализовано |

---

## 🔒 Безопасность

- **Аутентификация** — Clerk (OAuth2, session tokens, middleware protection)
- **Rate Limiting** — Upstash Redis (sliding window)
- **Валидация** — Zod-схемы на всех серверных экшенах
- **CSRF** — Next.js Server Actions (встроенная защита)
- **Security Headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy
- **Бан-система** — блокировка по userId и IP-адресу

---

## 📈 Ключевые технические решения

| Решение                                | Обоснование                                              |
| -------------------------------------- | -------------------------------------------------------- |
| **Server Components + Server Actions** | Минимизация клиентского JS, быстрая загрузка             |
| **Standalone Docker output**           | Минимальный образ (~150MB vs ~1GB node_modules)          |
| **tRPC + React Query**                 | Type-safe API с автоматическим кешированием              |
| **Prisma + Neon**                      | Serverless PostgreSQL, автоскейлинг, миграции            |
| **iCal-синхронизация**                 | Интеграция с внешними календарями без зависимости от API |
| **React Email**                        | Типизированные email-шаблоны как React-компоненты        |
| **Multi-stage Docker**                 | 3 стадии: deps → build → run для оптимального размера    |
| **Edge Middleware**                    | Auth-проверка на CDN-уровне до рендеринга                |

---

## 🗺️ Roadmap

- [ ] Авторизация через VK ID / Yandex ID (замена Clerk)
- [ ] Онлайн-оплата бронирования через ЮKassa
- [ ] Мобильное приложение (React Native)
- [ ] Telegram-бот для уведомлений
- [ ] AI-рекомендации студий

---

## 👨‍💻 Автор

Разработано **одним fullstack-разработчиком** — от проектирования архитектуры до production деплоя.

**Стек навыков, продемонстрированных в проекте:**

- Fullstack-разработка (React, Next.js, Node.js, TypeScript)
- Проектирование базы данных (PostgreSQL, Prisma ORM, 19 моделей)
- Интеграция платёжных систем (ЮKassa API, Robokassa)
- DevOps (Docker, CI/CD, Nginx, Linux)
- UI/UX (Responsive design, PWA, Accessibility)
- SEO (SSR, OG-images, Structured Data, sitemap)
- Мониторинг и отладка (Sentry, логирование)

---

## 📄 Лицензия

MIT © 2025–2026 [djteoz](https://github.com/djteoz)

---

<div align="center">

**[🌐 photomarket.tech](https://www.photomarket.tech)**

Разработано с ❤️ в России

</div>
