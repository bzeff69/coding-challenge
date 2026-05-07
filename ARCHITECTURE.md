# Streak — Architecture

## System Overview

Streak is a full-stack web application with a React SPA frontend, an ASP.NET Core API backend, and SQLite for persistence — all containerized with Docker Compose and served through an nginx reverse proxy.

```
                    +---------------------------+
                    |      Docker Compose        |
                    |                           |
  Browser :3000 --> |  +---------------------+  |
                    |  |  nginx (frontend)    |  |
                    |  |  Serves SPA (React)  |  |
                    |  |  /api/* --> proxy     |--+---> :5000
                    |  +---------------------+  |        |
                    |                           |  +-----v-----------+
                     |                           |  |  ASP.NET Core   |
                     |                           |  |  Minimal API    |
                     |                           |  | auth + habits   |
                    |                           |  +-----+-----------+
                    |                           |        |
                    |                           |  +-----v-----------+
                    |                           |  |  SQLite         |
                    |                           |  |  habits.db      |
                    |                           |  |  (Docker vol)   |
                    |                           |  +-----------------+
                    +---------------------------+
```

---

## Frontend Architecture

### Stack
- **React 19** with functional components and hooks
- **TypeScript** for full type safety
- **Vite 8** for dev server + production builds
- **Tailwind CSS v4** with custom dark mode variant

### Component Tree
```
App
 ├── Header (logo, nav, mobile menu, theme toggle)
 ├── AuthForm                   (login/register screen)
 ├── SkeletonCards              (loading state)
 ├── EmptyState                 (no habits)
 ├── HabitCard[]                (main UI)
 │    ├── Confetti              (completion animation)
 │    ├── MessageBanner         (flash messages)
 │    ├── HistoryStrip          (7-day view + inline editor)
 │    ├── StatsPanel            (streak, best, completed, rate)
 │    └── FullHistory           (90-day calendar modal)
 ├── HabitForm                  (create/edit modal)
 ├── Dashboard                  (analytics modal)
 │    ├── StatCard[]            (gradient stat cards)
 │    ├── Heatmap               (30-day grid)
 │    └── Per-habit breakdown   (progress bars + stats)
 └── DeletedHabits              (trash modal)
```

### State Management
All app state lives in the **`useHabits`** hook, which owns:
- `habits` — active habit array
- `deletedHabits` — soft-deleted habits
- `messages` — per-habit funny messages (keyed by habit ID)
- `missedHabits` — set of habit IDs that missed days since last load
- `loading` — initial fetch state
- Session state from `useAuth()` gates all habit data requests

**Data flow pattern:** Fire-and-forget API calls. Every user action (increment, undo, edit, delete) fires an API request, and the response replaces local state. No optimistic updates — the server is the source of truth.

```
User Action → api.increment(id)
                 │
                 ▼
           POST /api/habits/{id}/increment
                 │
                 ▼
           Server: mutate state, recalculate stats, save to SQLite
                 │
                 ▼
           Response: { habits, deletedHabits, missedHabitIds }
                 │
                 ▼
           applyState() → setState({ habits, deletedHabits })
                 │
                 ▼
           React re-renders with new data
```

### Hooks
| Hook | Purpose |
|---|---|
| `useAuth()` | Session restore/login/register/logout |
| `useHabits()` | All habit state + API mutations |
| `useTheme()` | Dark/light mode with system detection + localStorage persistence |

### API Client (`src/api/client.ts`)
Thin typed fetch wrapper over the auth + habit endpoints. Habit mutations return `Promise<StateResponse>`, while auth endpoints return the current user or clear the active session. Base URL is `/api`, proxied by nginx in production and Vite dev proxy in development.

### Styling & Theming
- Tailwind CSS v4 with `@custom-variant dark (&:is(.dark *))` — dark mode via class on `<html>`
- CSS variables for heatmap colors (swap between light/dark/print palettes)
- Custom keyframe animations: `confetti-fall`, `card-enter`, `glow-pulse`, `skeleton-shimmer`
- Print styles force light mode and isolate dashboard content

---

## Backend Architecture

### Stack
- **ASP.NET Core 8** Minimal API
- **SQLite** via `Microsoft.Data.Sqlite`
- Session cookie auth backed by PBKDF2 password hashes and hashed session tokens
- Runs on port 5000 inside the container

### API Endpoints
| Method | Route | Description |
|---|---|---|
| GET | `/api/auth/session` | Return the currently logged-in user from the session cookie |
| POST | `/api/auth/register` | Create a user account and start a session |
| POST | `/api/auth/login` | Log in and start a session |
| POST | `/api/auth/logout` | Clear the active session |
| GET | `/api/state` | Load the current user's full state, process missed days, return with missedHabitIds |
| POST | `/api/habits` | Create a new habit |
| PUT | `/api/habits/{id}` | Edit habit (name, target, color) |
| DELETE | `/api/habits/{id}` | Soft-delete (move to trash) |
| POST | `/api/habits/{id}/increment` | +1 to today's count |
| POST | `/api/habits/{id}/undo` | -1 from today's count |
| PUT | `/api/habits/{id}/days/{date}` | Set a specific day's count |
| POST | `/api/habits/{id}/restore` | Restore from trash |
| DELETE | `/api/habits/{id}/permanent` | Permanently delete |

Every mutation endpoint returns the same `StateResponse` shape:
```json
{
  "habits": [...],
  "deletedHabits": [...],
  "missedHabitIds": [...]
}
```

### Business Logic (`HabitLogic.cs`)
All domain logic is ported from the TypeScript frontend to C#, ensuring identical behavior:

| Method | What it does |
|---|---|
| `CreateHabit()` | Initialize a new habit with defaults |
| `ProcessMissedDays()` | Detect gaps since last evaluation, reset streak if needed |
| `RecalculateStats()` | Recompute totalCompletions, currentStreak, longestStreak |
| `Increment()` | +1, mark completed if count >= target |
| `Undo()` | -1, unmark completed, recalculate |
| `SetDayCount()` | Set specific date to a count (0 deletes the record) |
| `Edit()` | Update properties, recalculate completion status for all days |

### Storage (`HabitStore.cs`)
SQLite with a single-row JSON blob pattern:

```sql
CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL
)
```

- **One row, one JSON blob** — the entire `AppState` (users, sessions, and per-user habit data) is serialized as JSON
- **Thread-safe** — all reads/writes wrapped in a C# `lock` statement
- **Why this pattern?** Keeps authentication and per-user habit data in one simple persisted document without introducing relational schema migrations

---

## Infrastructure

### Docker Compose
```yaml
services:
  api:       # ASP.NET Core → port 5001:5000, volume habit_data:/app/data
  frontend:  # nginx → port 3000:80, depends_on api

volumes:
  habit_data:  # Named volume for SQLite persistence
```

### Build Pipeline
Both services use **multi-stage Docker builds** to minimize image size:

**Frontend:**
```
node:22-alpine  →  npm ci + vite build  →  dist/
nginx:alpine    →  copy dist + nginx.conf  →  serve
```

**Backend:**
```
dotnet/sdk:8.0     →  dotnet restore + publish  →  /app/publish
dotnet/aspnet:8.0  →  copy published app         →  run
```

### Reverse Proxy (nginx)
```
/api/*  →  proxy_pass http://api:5000/api/   (backend)
/*      →  try_files $uri $uri/ /index.html  (SPA fallback)
```

### Development Mode
Vite dev server at `:5173` with HMR + proxy:
```
/api  →  http://localhost:5001  (Docker API exposed to host)
```

---

## Data Model

```typescript
Habit {
  id: string              // UUID
  name: string
  dailyTarget: number     // 1-10
  color: string           // indigo | violet | rose | pink | orange | amber | teal | cyan
  createdAt: string       // ISO date
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  lastEvaluatedDate: string
  dayRecords: {
    [date: string]: {     // "YYYY-MM-DD"
      date: string
      count: number
      completed: boolean
    }
  }
}
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| JSON blob in SQLite | Keeps users, sessions, and per-user state in one simple persisted document |
| Server as source of truth | No optimistic updates, no conflict resolution needed — response replaces local state |
| Fire-and-forget mutations | Keeps hook return signatures synchronous, components don't deal with promises |
| Business logic in both TS and C# | Frontend logic preserved for message generation; backend logic for data integrity |
| Messages stay on frontend | Humor is a UI concern, not a data concern — keeps API focused |
| Browser `window.print()` for PDF | Zero dependencies, works everywhere, print CSS handles the rest |
| CSS-only animations | Confetti, skeleton shimmer, glow pulse, card entrance — no animation libraries needed |
| Single-row DB table | Atomic reads/writes, no partial state, trivial backup (copy one file) |
