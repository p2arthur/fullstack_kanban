```markdown
# Project Management MVP — Root AGENTS.md

## Business Requirements

- User sign-in (hardcoded: user/password for MVP, DB supports multi-user future)
- Kanban board per user: fixed columns (renamable), drag-and-drop cards
- AI sidebar: creates/edits/moves cards via chat
- Local deployment (Docker container)

## Tech Stack

**Frontend:** Next.js (existing MVP in `frontend/`)  
**Backend:** Node.js + Express + TypeScript  
**Database:** SQLite (auto-create if missing)  
**AI:** OpenRouter (`openai/gpt-oss-120b`) — API key in `.env`  
**Package Manager:** pnpm (root workspace)  
**Container:** Docker (single-container fullstack)

## Color Scheme

- Accent Yellow: `#ecad0a` — highlights, borders
- Blue Primary: `#209dd7` — links, interactive elements
- Purple Secondary: `#753991` — CTAs, buttons
- Dark Navy: `#032147` — headings
- Gray Text: `#888888` — labels, secondary text

## Coding Standards

1. **Latest idiomatic patterns** — no legacy approaches
2. **Simplicity over cleverness** — no over-engineering, no defensive bloat, no extra features
3. **Concise documentation** — minimal README, no emojis, plain language
4. **Root cause first** — never guess fixes; prove with evidence, then solve

## Success Criteria

- User logs in → sees Kanban board
- Cards drag-and-drop smoothly across columns
- AI sidebar responds and mutates board state correctly
- Single `docker compose up` starts entire stack
- Zero manual setup (DB auto-creates, frontend builds on container start)

## Project Structure
```

/
├── frontend/ # Next.js app (existing MVP)
├── backend/ # Express API + SQLite
├── docs/PLAN.md # Execution roadmap
├── scripts/ # start/stop for Mac/PC/Linux
├── docker-compose.yml
└── .env # OPENROUTER_API_KEY

```

## Working Documentation

All planning and execution notes live in `docs/`. Review `docs/PLAN.md` before starting work.

## Style Notes

- No AI-slop aesthetics — clean, intentional UI
- Functional > decorative
- Accessible color contrast (meet WCAG AA)
- Fast, lightweight, zero bloat
```
