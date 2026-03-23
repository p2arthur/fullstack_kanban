# Project Plan — Fullstack Kanban

## Current State

- **Frontend:** Vite + React MVP is functional — Kanban board with columns, cards, drag-and-drop, and add-card form.
- **Backend:** `server/` directory exists but is empty.
- **Database:** Not yet created.
- **Auth:** Not yet implemented.
- **AI sidebar:** Not yet implemented.
- **Docker:** Not yet configured.

---

## Remaining Phases

### Phase 1 — Backend Scaffolding

Set up Express + TypeScript server with SQLite database.

- Scaffold `server/` with Express + TypeScript (`pnpm`, `tsconfig.json`)
- Add `better-sqlite3` and auto-create DB + tables on startup
- Schema: `users`, `boards`, `columns`, `cards`, `chat_history`
- Seed default user (`user` / `password`, hashed) and one board on first run
- Routes:
  - `GET /health`
  - `POST /api/auth/login` — validate credentials, return session (JWT in httpOnly cookie)
  - `POST /api/auth/logout`
  - `GET /api/boards/:boardId` — fetch board with columns and cards
  - `POST /api/cards` — create card
  - `PATCH /api/cards/:id` — update title / description / column / position
  - `DELETE /api/cards/:id`

**Success criteria:** `curl http://localhost:4000/health` returns `{"status":"ok"}`. CRUD routes work via Postman/curl.

---

### Phase 2 — Auth Flow

- Add login page to frontend (`/login`)
- Protect Kanban route — redirect unauthenticated users to `/login`
- Add logout button
- Backend middleware: `requireAuth` on all `/api/boards` and `/api/cards` routes

**Success criteria:** Cannot access board without login. Login/logout cycle works end-to-end.

---

### Phase 3 — Frontend + Backend Integration

- Replace hardcoded `data.ts` with real API calls
- Drag-and-drop updates persist to backend (`PATCH /api/cards/:id`)
- Create / edit / delete cards via UI, synced to DB
- Handle loading states and API errors

**Success criteria:** Board state persists across page refreshes. All CRUD operations reflected in SQLite.

---

### Phase 4 — AI Integration

- Add OpenRouter client (`server/src/ai/client.ts`) using `OPENROUTER_API_KEY` from `.env`
- `POST /api/ai/chat` — accepts board state + chat history + user message, returns structured response:

```ts
interface AIResponse {
  message: string;
  board_update?: {
    create?: { title: string; description?: string; column: string }[];
    update?: { id: number; title?: string; description?: string; column?: string }[];
    delete?: number[];
  };
}
```

- Apply board mutations via existing CRUD functions
- Persist chat history in `chat_history` table
- Add AI sidebar component to frontend — chat input, message history, auto-refresh board on mutations

**Success criteria:** User can chat with AI to create, move, edit, and delete cards. Board updates reflect immediately.

---

### Phase 5 — Docker + Final Validation

- Write `Dockerfile` (multi-stage: frontend build → backend build → runtime)
- Write `docker-compose.yml` (single container, env vars, port 4000)
- Add `scripts/start.sh` and `scripts/stop.sh`
- Add `.env.example`
- Verify: `docker compose up` starts entire stack with zero manual setup
- Confirm: no console errors, color scheme matches spec, UI is accessible

**Success criteria:** `docker compose up` → login → use board → chat with AI → all working from a cold start.

---

## Tech Stack (Actual)

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Vite + React + TypeScript           |
| Backend  | Node.js + Express + TypeScript      |
| Database | SQLite via `better-sqlite3`         |
| AI       | OpenRouter (`openai/gpt-oss-120b`)  |
| Package  | pnpm (root workspace)               |
| Deploy   | Docker (single container)           |
