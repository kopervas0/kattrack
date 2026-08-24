# KatTrack

Пет-проект: трекер откликов на вакансии (компания, позиция, статус, зарплата, заметки).
Собран специально так, чтобы задействовать весь стек из вакансии **Junior Full Stack Developer** (ООО «Профиторг»).

## Стек и как он закрывает требования вакансии

| Требование из вакансии                          | Где реализовано |
|--------------------------------------------------|------------------|
| HTML5/CSS3/JS (ES6+)                              | `frontend/index.html`, `frontend/src/styles.css`, весь фронтенд написан на современном ES6+ |
| Frontend-фреймворк (React/Vue/Angular)            | `frontend/` — React 18 |
| Backend-язык (Node.js/Python/Java/PHP/C#)         | `backend/` — Node.js |
| ООП, клиент-серверная архитектура                 | Слои `controllers → services → repositories` в `backend/src`, классы `AuthService`, `ApplicationService`, `*Repository` |
| SQL и работа с БД                                 | `backend/src/db/schema.sql`, ручные SQL-запросы в `backend/src/repositories/*` (без ORM, специально) |
| Git                                               | Обычный git-репозиторий, `.gitignore`, CI на пуш/PR |
| REST API, интеграция frontend↔backend             | `backend/src/routes/*`, фронтенд ходит на `/api/*` через `frontend/src/api/client.ts` |
| Express.js (плюс)                                 | Бэкенд построен на Express |
| TypeScript (плюс)                                 | И фронт, и бэк на TypeScript со строгим режимом |
| Docker, Linux (плюс)                              | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` |
| CI/CD, тестирование (плюс)                        | `.github/workflows/ci.yml` — lint, типы, тесты, сборка Docker-образов на каждый push/PR; юнит-тесты в `backend/tests` (Jest) и `frontend/tests` (Vitest + Testing Library) |

## Структура

```
kattrack/
  backend/     Node.js + Express + TypeScript REST API, PostgreSQL, JWT-авторизация
  frontend/    React + TypeScript (Vite) SPA
  docker-compose.yml   поднимает db + backend + frontend одной командой
  .github/workflows/ci.yml   пайплайн CI
```

## Запуск через Docker (проще всего)

```bash
docker compose up --build
```

- Фронтенд: http://localhost:5173
- API: http://localhost:4000/api
- PostgreSQL: localhost:5432 (user/pass/db: `kattrack`)

Схема БД (`backend/src/db/schema.sql`) применяется автоматически при первом старте контейнера с Postgres.

## Локальный запуск без Docker

```bash
# backend
cd backend
cp .env.example .env       # поправьте DATABASE_URL под свою локальную БД
psql -f src/db/schema.sql  # применить схему к уже поднятой PostgreSQL
npm install
npm run dev                # http://localhost:4000

# frontend, в отдельном терминале
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

## Тесты и линт

```bash
cd backend && npm run lint && npm run build && npm test
cd frontend && npm run lint && npm test && npm run build
```

Эти же команды прогоняются автоматически в GitHub Actions при каждом push и pull request (`.github/workflows/ci.yml`).

## API (кратко)

- `POST /api/auth/register` — регистрация `{ email, password }`
- `POST /api/auth/login` — вход, возвращает `{ user, token }`
- `GET /api/applications?status=interview` — список откликов (JWT обязателен), фильтр по статусу опционален
- `GET /api/applications/stats` — количество откликов по статусам
- `POST /api/applications` — создать отклик
- `PATCH /api/applications/:id` — обновить отклик
- `DELETE /api/applications/:id` — удалить отклик

## Как развивать дальше (следующие бонусы из вакансии)

- Docker уже есть — можно добавить `docker-compose` профиль для тестовой БД в CI.
- Next.js: `frontend` легко мигрировать на Next.js вместо Vite, сохранив компоненты — закроет ещё один бонусный пункт.
- Веб-аналитика: подключить Яндекс.Метрику в `index.html` фронтенда.
- CI/CD: добавить job деплоя (например, на Render/Railway) после успешного `docker-build`.

## Известное ограничение сборки этого черновика

Код был написан и вручную вычитан в изолированной среде без доступа к npm registry,
поэтому `npm install`/тесты здесь не запускались физически — их нужно прогнать в CI
или локально (команды выше). Логика юнит-тестов не зависит от реальной БД (моки репозиториев),
так что они должны пройти сразу после `npm install`.
