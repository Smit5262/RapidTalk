# RapidTalk

A real-time team collaboration platform — workspaces, channels, live messaging, and AI-assisted
productivity features. Built as a full-stack portfolio project, rewritten from an early MVP into a
production-shaped application with a clean, layered architecture.

## Features

Auth & Accounts
- Email/password registration and login
- JWT access tokens with rotating refresh tokens (httpOnly cookies)
- Silent session refresh on page reload

Workspaces & Channels
- Create and switch between workspaces
- Role-based access control (Owner / Admin / Member / Guest)
- Public and private channels, pin/favorite channels
- Invite teammates by shareable link or directly by email (with a live in-app notification and
  Accept/Decline)

Real-Time Messaging
- Instant messaging over Socket.IO, scoped to workspace/channel rooms
- Typing indicators, online/offline presence
- Edit and delete your own messages
- Emoji reactions
- @mentions that notify the mentioned teammate in real time
- File/image uploads (S3-compatible storage via presigned URLs)

Notifications
- Live notification center (bell icon with unread badge)
- Mentions and workspace invites surface here instantly via WebSocket push

AI Assistant (Groq-powered, provider-abstracted so the LLM backend can be swapped)
- Summarize a channel's recent conversation
- Generate suggested replies
- Generate meeting notes
- Translate or rewrite a message
- Extract a message into a structured action item

Analytics Dashboard
- Per-workspace stats: messages sent, active users, files shared, AI usage
- Activity charts and recent events

Polish
- Dark/light theme (persisted, respects system preference)
- Command palette (Cmd/Ctrl+K) for fast workspace/channel navigation
- Loading skeletons, empty states, and error states throughout

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, React Hook Form + Zod |
| Backend    | Node.js, Express, TypeScript |
| Real-time  | Socket.IO |
| Database   | PostgreSQL + Prisma ORM |
| Cache      | Redis |
| Storage    | S3-compatible object storage (MinIO for local dev) |
| AI         | Groq API (Llama 3.3 70B), behind a swappable provider interface |
| Infra      | Docker Compose, Nginx, GitHub Actions CI |

## Architecture

Backend follows a layered pattern per feature:

```
validator → repository → service → controller → routes
```

- validators/ — Zod schemas, request shape validation
- repositories/ — Prisma data access only, no business logic
- services/ — business logic, throws typed `AppError`s
- controllers/ — HTTP layer, delegates to services, returns a consistent
  `{ success, message, data, errors }` envelope
- routes/ — wiring, auth/RBAC middleware, validation middleware

Frontend is feature-sliced: `features/<name>/` bundles a feature's hooks (TanStack Query) and
components together; `store/` holds Zustand stores for live/global state (auth, current workspace,
chat messages, notifications, UI theme).

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop
- A free [Groq API key](https://console.groq.com) (for AI features)

### 1. Clone and configure environment

```bash
git clone https://github.com/smit-vaddoriya/RapidTalk.git
cd RapidTalk

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Generate two JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Paste one into `JWT_ACCESS_SECRET` and the other into `JWT_REFRESH_SECRET` in `backend/.env`.

Add your Groq key to `backend/.env`:
```
GROQ_API_KEY=your_key_here
```

For file uploads, either point `S3_*` vars at a real S3 bucket, or run MinIO locally (see
`docker-compose.yml` — a `minio` service is included) and create a `rapidtalk` bucket with public
read access via the MinIO console at `http://localhost:9001`.

### 2. Start infrastructure

```bash
docker compose up -d postgres redis minio
```

### 3. Run the backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

API runs at `http://localhost:4000`. Health check: `GET /api/health`. API docs (dev only): `GET /api/docs`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### 5. Try it out

Register an account, create a workspace, create a channel, and start messaging. Open a second
browser window (or invite a teammate by email/link) to see real-time sync in action.

## Testing

```bash
cd backend
npm test
```

Unit tests cover core service logic (auth flows, workspace role permissions, message
ownership/edit/delete rules).

## Project Structure

```
RapidTalk/
├── backend/        Express + TypeScript API
│   ├── prisma/       schema.prisma, migrations
│   └── src/
│       ├── config/       env, database, redis, logger, S3
│       ├── controllers/  HTTP layer
│       ├── services/     business logic (incl. services/ai/ for the AI provider abstraction)
│       ├── repositories/ Prisma data access
│       ├── middlewares/  auth, RBAC, rate limiting, validation
│       ├── routes/       route registration
│       ├── socket/       Socket.IO server + event handlers
│       └── validators/   Zod schemas
├── frontend/       React 19 + Vite + TypeScript
│   └── src/
│       ├── features/     feature-sliced modules (auth, workspaces, channels, messages, ai, ...)
│       ├── components/ui/  shared UI primitives
│       ├── store/         Zustand stores
│       ├── pages/         route-level components
│       └── services/      API client, Socket.IO client
├── nginx/          reverse proxy config for production
└── docker-compose.yml
```

## License

MIT