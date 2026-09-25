# KatTrack

Пет-проект: трекер откликов на вакансии (компания, позиция, статус, зарплата, заметки).
Есть два уровня доступа: **пользователь** ведёт свои отклики, **администратор** управляет
пользователями и системными настройками через админ-панель.
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
Кроме того, при каждом старте бэкенд выполняет идемпотентные миграции (`backend/src/db/migrate.ts`),
так что уже существующая база тоже получит новые поля и таблицы.

### Учётная запись администратора

Первый администратор создаётся при старте бэкенда из переменных окружения
`ADMIN_EMAIL` / `ADMIN_PASSWORD` (в `docker-compose.yml` и `backend/.env.example`):

- email: `admin@kattrack.local`
- пароль: `admin12345`

Если пользователь с таким email уже есть, он просто получает роль администратора (пароль не меняется).
Другие администраторы назначаются из админ-панели.

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

## Роли и возможности

| Возможность | Пользователь | Администратор |
|---|:---:|:---:|
| Регистрация, вход | ✅ | ✅ |
| Добавление / редактирование / удаление своих откликов | ✅ | ✅ |
| Фильтр по статусу, статистика по своим откликам | ✅ | ✅ |
| Просмотр объявления от администратора | ✅ | ✅ |
| Админ-панель (`/admin`) | — | ✅ |
| Список пользователей с поиском и количеством откликов | — | ✅ |
| Блокировка / разблокировка пользователя | — | ✅ |
| Назначение / снятие роли администратора | — | ✅ |
| Удаление пользователя вместе с его откликами | — | ✅ |
| Общая статистика системы | — | ✅ |
| Настройки: вкл/выкл регистрацию, лимит откликов, текст объявления | — | ✅ |

Ограничения безопасности: администратор не может заблокировать, понизить или удалить сам себя.
Блокировка и смена роли действуют сразу: пользователь перечитывается из БД на каждом запросе,
а не только при истечении JWT.

## API (кратко)

- `POST /api/auth/register` — регистрация `{ email, password }`
- `POST /api/auth/login` — вход, возвращает `{ user, token }`
- `GET /api/applications?status=interview` — список откликов (JWT обязателен), фильтр по статусу опционален
- `GET /api/applications/stats` — количество откликов по статусам
- `POST /api/applications` — создать отклик
- `PATCH /api/applications/:id` — обновить отклик
- `DELETE /api/applications/:id` — удалить отклик
- `GET /api/auth/me` — текущий пользователь (с актуальной ролью)
- `GET /api/settings/public` — публичные настройки: разрешена ли регистрация, объявление, лимит

Только для администратора (иначе `403`):

- `GET /api/admin/users` — список пользователей с количеством откликов
- `PATCH /api/admin/users/:id/block` — `{ isBlocked: true | false }`
- `PATCH /api/admin/users/:id/role` — `{ role: "user" | "admin" }`
- `DELETE /api/admin/users/:id` — удалить пользователя и его отклики
- `GET /api/admin/stats` — статистика по пользователям и откликам
- `GET /api/admin/settings` / `PUT /api/admin/settings` — `{ registrationEnabled, maxApplicationsPerUser, announcement }`

## Как развивать дальше (следующие бонусы из вакансии)

- Docker уже есть — можно добавить `docker-compose` профиль для тестовой БД в CI.
- Next.js: `frontend` легко мигрировать на Next.js вместо Vite, сохранив компоненты — закроет ещё один бонусный пункт.
- Веб-аналитика: подключить Яндекс.Метрику в `index.html` фронтенда.
- CI/CD: добавить job деплоя (например, на Render/Railway) после успешного `docker-build`.
