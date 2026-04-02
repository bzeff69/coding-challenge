# Streak — Track habits. Get judged.

A gamified habit tracker with humor and consequence. Track daily habits, build streaks, get roasted when you miss a day, and celebrate (sarcastically) when you succeed.

## Features

- Create habits with custom daily targets and colors
- Tap to increment, track completions, and build streaks
- Sarcastic, funny messages for every action (progress, completion, undo, missed days)
- 7-day history strip with full calendar view
- Dashboard with aggregate stats, 30-day heatmap, and per-habit breakdown
- PDF export from the dashboard
- Soft-delete and restore habits
- Dark mode
- Responsive design (mobile dropdown menu, desktop toolbar)
- Persistent backend with ASP.NET Core + SQLite

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4
- **Backend:** ASP.NET Core 8 Minimal API, SQLite
- **Infrastructure:** Docker Compose, nginx reverse proxy

## Running with Docker

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# From the project root
docker compose build
docker compose up -d
```

The app will be available at **http://localhost:3000**.

- Frontend is served by nginx on port 3000
- API runs internally on port 5000, proxied via nginx at `/api/`
- Data persists in a Docker volume (`habit_data`)

To stop:

```bash
docker compose down
```

To stop and remove all data:

```bash
docker compose down -v
```

## Development (without Docker)

Prerequisites: Node.js 22+, the API container running for backend.

```bash
# Start the API container
docker compose up -d api

# Install dependencies and start dev server
npm install
npm run dev
```

The Vite dev server runs at **http://localhost:5173** and proxies `/api` requests to the Docker API on port 5001.

## Project Structure

```
src/
  api/           API client
  components/    React components (HabitCard, Dashboard, HabitForm, etc.)
  domain/        Business logic and types
  hooks/         React hooks (useHabits, useTheme)
  utils/         Date and color utilities
api/             ASP.NET Core backend
  Program.cs     API endpoints
  HabitLogic.cs  Business logic (C# port)
  HabitStore.cs  SQLite persistence
```
