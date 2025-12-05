# Swift Response Grid  AI-Powered Disaster Command Center

AI-driven dashboard for monitoring disasters, triaging citizen reports, and coordinating response teams in real time.

> Built as a full-stack demo: real-time updates, protected routes with roles, AI insights, and a polished command-center UI.

---

## Live Demo

- _(Optional)_ **Live URL:** `https://your-deployment-url-here`  
  Add your Netlify/Vercel URL here once you deploy.

---

## Features

- **AI Insights**  
  Central `AI Insights` page shows model confidence, risk summaries, and recommended mitigation actions.

- **Predictions**  
  AI-powered disaster predictions with severity filters, model confidence, and early-warning window.

- **Alerts Center**  
  Live alert feed with unread counts, severity chips, and **“new alert”** highlight when events stream in.

- **Reported Disasters**  
  `/reports` page listing citizen and field reports with severity + status badges and filters.

- **Real-time Updates**  
  WebSocket-powered updates for alerts, stats, and resources via a shared `useRealtimeData` hook.

- **Role-based Access Control**  
  Simple front-end auth with roles:
  - `admin@example.com` – full access
  - `responder@example.com` – field operations focus
  - `civilian@example.com` – citizen-facing view

- **Modern UI & Theming**  
  Command-center style layout (sidebar + header), dark theme, Tailwind-based components, and subtle animations.

---

## Tech Stack

- **Frontend**
  - React 18 + Vite
  - React Router
  - Tailwind CSS + shadcn-style UI components
  - TanStack Query (React Query)
  - Socket.IO client for realtime updates

- **Backend**
  - Node.js + Express
  - PostgreSQL (via `pg`)
  - Socket.IO server
  - Helmet, CORS, Morgan

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Frontend (Command Center UI)

```bash
cd ./
npm install
npm run dev
```

The frontend runs by default at **http://localhost:5173**.

### Backend (API + Realtime Socket)

```bash
cd server
npm install
npm run dev
```

The backend runs by default at **http://localhost:3001** and exposes REST + Socket.IO endpoints under `/api`.

---

## Auth & Roles

- Frontend-only auth using a simple `AuthProvider` with localStorage persistence.
- Login with one of the demo emails (any password):
  - `admin@example.com`
  - `responder@example.com`
  - `civilian@example.com`
- Protected routes (`/`, `/predictions`, `/alerts`, `/analytics`, `/reports`, etc.) use a `RequireAuth` wrapper.

---

## Screenshots

Add PNGs under a `docs/` folder and link them here, for example:

- `docs/dashboard.png` – Main command center overview
- `docs/alerts.png` – Real-time alert feed with unread counts
- `docs/reports.png` – Reported disasters list with filters

```md
![Dashboard](docs/dashboard.png)
![Alerts](docs/alerts.png)
![Reported Disasters](docs/reports.png)
```

---

## Notes

- This project is optimized as a **portfolio-friendly demo**: it showcases real-time UX, AI storytelling in the UI, and role-based access, even when running on mocked or sample data.