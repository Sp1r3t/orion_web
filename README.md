# WebAgency

Сайт на **React 19 + TypeScript + Vite**.

## Требования

- Node.js 20+ (проверено на 22)
- npm 10+

## Быстрый старт

```bash
npm install
npm run dev
```

Дев-сервер поднимется на http://localhost:5173.

## Скрипты

| Команда                 | Что делает                                  |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Дев-сервер с горячей перезагрузкой          |
| `npm run build`         | Проверка типов + продакшн-сборка в `dist/`  |
| `npm run preview`       | Локальный просмотр продакшн-сборки          |
| `npm run lint`          | Линтер (oxlint)                             |
| `npm run lint:fix`      | Линтер с автоисправлением                   |
| `npm run format`        | Форматирование Prettier                     |
| `npm run format:check`  | Проверка форматирования (используется в CI) |
| `npm run typecheck`     | Только проверка типов TypeScript            |
| `npm test`              | Тесты (Vitest + Testing Library)            |
| `npm run test:watch`    | Тесты в watch-режиме                        |
| `npm run test:coverage` | Тесты с отчётом о покрытии                  |

## Структура

```
src/
  components/   переиспользуемые компоненты (Layout, Header, Footer, Button)
  pages/        страницы-маршруты (Home, About, Contact, NotFound)
  hooks/        кастомные хуки
  lib/          утилиты и работа с API
  styles/       глобальные стили
  test/         настройка тестового окружения
  App.tsx       описание маршрутов
  main.tsx      точка входа
```

Алиас `@/` указывает на `src/`, например: `import Header from '@/components/Header'`.

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и задайте значения. В браузер попадают только
переменные с префиксом `VITE_`, доступ через `import.meta.env.VITE_API_URL`.

## Деплой

`npm run build` собирает статику в `dist/` — её можно выложить на Vercel, Netlify, GitHub Pages
или любой статический хостинг. Для SPA-роутинга настройте fallback всех путей на `index.html`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) на каждый push в `main` и каждый pull request
прогоняет формат, линтер, типы, тесты и сборку.
