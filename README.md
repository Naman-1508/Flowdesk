# ⚡ FlowDesk

> **Stop switching. Start shipping.**

FlowDesk is a terminal-inspired developer focus application built for engineers who want to maximize deep-work time on their GitHub issues. It combines a structured Pomodoro-style session engine, AI-generated context bundling via Groq, and a beautiful dark-mode UI into one immersive workspace.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Focus Sessions** | Pomodoro-style timer with SVG ring, dynamic color shifts, and pause/resume |
| 🗂️ **Kanban Board** | Drag-and-drop GitHub issues across To Focus → In Progress → Done |
| 🤖 **AI Context Panel** | Groq-powered context bundle: summary, where-you-left-off, suggested next step |
| 📝 **Autosave Notes** | Per-issue notes saved to Convex in real-time during sessions |
| 📊 **Focus Heatmap** | GitHub contribution-style heatmap of all your deep work |
| 📈 **Weekly Chart** | Recharts bar graph of focus hours per day |
| 🏆 **Session History** | Full session log with expandable AI resume notes + CSV export |
| ⌨️ **Command Palette** | `Cmd+K` global fuzzy-search command launcher |
| 🔥 **Streak Tracking** | Daily focus streaks stored in Convex |
| 🎉 **Confetti Completion** | Animated session-complete modal with AI-generated resume note |
| 🌑 **Dark Mode** | Terminal-luxury dark theme — `#080810` base, indigo + cyan accents |
| ♿ **Accessible** | All animations respect `prefers-reduced-motion` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4, CSS Variables |
| **Animation** | Framer Motion |
| **Database / Real-time** | Convex |
| **Auth** | NextAuth.js v4 (GitHub OAuth) |
| **AI** | Groq (`llama-3.3-70b-versatile`) |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Charts** | Recharts |
| **State** | Zustand |
| **Fonts** | Syne (headings) + JetBrains Mono (code/body) |
| **Icons** | Lucide React |
| **Date Utils** | date-fns |
| **Search** | Fuse.js (fuzzy search) |

---

## 📁 Project Structure

```
flowdesk/
├── convex/                     # Backend (Convex serverless functions)
│   ├── schema.ts               # Database schema
│   ├── users.ts                # User CRUD + streak logic
│   ├── sessions.ts             # Session save + analytics queries
│   ├── notes.ts                # Per-issue notes (autosave)
│   └── contextCache.ts         # AI context caching (1hr TTL)
│
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Login page (GitHub OAuth)
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/      # Main stats dashboard
│   │   │   ├── focus/          # Focus session engine
│   │   │   ├── tasks/          # Kanban board
│   │   │   ├── sessions/       # Session history + CSV export
│   │   │   ├── heatmap/        # Annual heatmap + weekly chart
│   │   │   └── settings/       # User preferences
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth route handler
│   │   │   ├── github/issues/  # GitHub open issues (server-side)
│   │   │   ├── github/commits/ # Recent commits per repo
│   │   │   ├── context/        # Groq AI context bundle
│   │   │   ├── resume-note/    # Groq AI session resume note
│   │   │   └── slack/status/   # Slack status update
│   │   ├── globals.css         # Design tokens + Tailwind v4 theme
│   │   └── layout.tsx          # Root layout with all providers
│   │
│   ├── components/
│   │   ├── ui/                 # Button, Card, Badge, Skeleton, Modal, Tooltip
│   │   ├── layout/             # Sidebar, TopBar, CommandPalette, HotkeyProvider
│   │   ├── dashboard/          # StatCard, FeaturedTask, RecentSessions
│   │   ├── focus/              # TimerRing, TaskSelector, ContextPanel,
│   │   │                       # BreakScreen, SessionComplete, AbandonModal
│   │   ├── tasks/              # KanbanBoard, IssueCard
│   │   └── heatmap/            # FocusHeatmap, WeeklyChart
│   │
│   ├── hooks/
│   │   ├── useTimer.ts         # Session countdown ticker
│   │   └── useReducedMotion.ts # Accessibility: reduced motion
│   │
│   ├── store/
│   │   ├── useSessionStore.ts  # Zustand: timer, task, session state machine
│   │   └── useUIStore.ts       # Zustand: sidebar, command palette, context panel
│   │
│   ├── lib/
│   │   ├── auth.ts             # NextAuth config
│   │   ├── utils.ts            # cn() class merger
│   │   └── session-score.ts    # Focus score calculator
│   │
│   └── types/
│       └── next-auth.d.ts      # Session + JWT type extensions
│
├── .env.local.example          # Template for required environment variables
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Where to get it |
|---|---|---|
| `NEXTAUTH_URL` | Full URL of your app | `http://localhost:3000` locally, `https://your-app.vercel.app` in prod |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | [github.com/settings/applications/new](https://github.com/settings/applications/new) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Same page as above |
| `GROQ_API_KEY` | Groq LLM API key | [console.groq.com](https://console.groq.com) (free tier) |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Auto-set by `npx convex dev` |
| `CONVEX_DEPLOYMENT` | Convex deployment name | Auto-set by `npx convex dev` |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm / pnpm
- GitHub account
- Convex account (free) — [dashboard.convex.dev](https://dashboard.convex.dev)
- Groq account (free) — [console.groq.com](https://console.groq.com)

### Step 1 — Clone & install

```bash
git clone https://github.com/your-username/flowdesk.git
cd flowdesk
npm install
```

### Step 2 — Set up Convex

```bash
npx convex dev
```

Follow the prompts to link your Convex project. This will:
- Push the database schema (users, sessions, notes, contextCache)
- Auto-write `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` to `.env.local`
- Start watching for function changes in `convex/`

> Keep `npx convex dev` running in a separate terminal during development.

### Step 3 — Create GitHub OAuth App (for localhost)

1. Go to [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Fill in:
   - **App name**: `FlowDesk (local)`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Generate a new client secret**
4. Copy both values into `.env.local`

### Step 4 — Fill `.env.local`

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>
GITHUB_CLIENT_ID=<your-id>
GITHUB_CLIENT_SECRET=<your-secret>
GROQ_API_KEY=<your-groq-key>
NEXT_PUBLIC_CONVEX_URL=<auto-filled-by-convex>
CONVEX_DEPLOYMENT=<auto-filled-by-convex>
```

### Step 5 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — log in with GitHub and start focusing.

---

## 🌐 Production Deployment (Vercel)

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "feat: initial FlowDesk release"
git push origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** → select your `flowdesk` repository
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** (it will fail on first deploy — that's expected, env vars not set yet)

### Step 3 — Add Environment Variables in Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Key | Value |
|---|---|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Your generated secret |
| `GITHUB_CLIENT_ID` | Production GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | Production GitHub OAuth Client Secret |
| `GROQ_API_KEY` | Your Groq API key |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex URL |
| `CONVEX_DEPLOYMENT` | Your Convex deployment name |

### Step 4 — Create Production GitHub OAuth App

1. Go to [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Fill in:
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Callback URL**: `https://your-app.vercel.app/api/auth/callback/github`
3. Copy `Client ID` and `Client Secret` into Vercel env vars

### Step 5 — Deploy Convex to Production

```bash
npx convex deploy --prod
```

This pushes your Convex functions and schema to production.

### Step 6 — Redeploy Vercel

In Vercel dashboard → **Deployments** → **Redeploy** (or push any commit).

✅ **Your app is now live!**

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + N` | Toggle Context Panel (during focus) |
| `Cmd/Ctrl + Enter` | Start Focus Session |
| `Space` | Pause / Resume Timer |
| `Escape` | Close modals / palette |
| `↑ / ↓` | Navigate command palette results |

---

## 🎨 Design System

FlowDesk uses a terminal-luxury dark theme defined via CSS variables:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#080810` | Page background |
| `--surface` | `#0f0f1a` | Card backgrounds |
| `--surface2` | `#13131f` | Input / nested surfaces |
| `--accent` | `#6366f1` | Primary (indigo) — timers, badges |
| `--accent2` | `#22d3ee` | Secondary (cyan) — AI elements |
| `--danger` | `#f43f5e` | Errors, abandon button |
| `--success` | `#10b981` | Completion, streaks |
| `--warning` | `#f59e0b` | Mid-score badges |

**Fonts:**
- **Syne** — headings (700/800 weight)
- **JetBrains Mono** — body, code, monospace everywhere else

---

## 🔌 API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handler |
| `/api/github/issues` | GET | ✅ | Fetch open issues from GitHub |
| `/api/github/commits` | GET | ✅ | Fetch recent commits for a repo |
| `/api/context` | GET | ✅ | Generate AI context bundle via Groq |
| `/api/resume-note` | POST | ✅ | Generate AI resume note via Groq |
| `/api/slack/status` | POST | ✅ | Update Slack status during focus |

---

## 🗃️ Database Schema (Convex)

### `users`
| Field | Type | Description |
|---|---|---|
| `githubId` | string | GitHub user ID (indexed) |
| `name` | string | Display name |
| `email` | string? | Email |
| `avatar` | string? | Avatar URL |
| `streakCount` | number | Current daily streak |
| `lastSessionAt` | number? | Timestamp of last session |

### `sessions`
| Field | Type | Description |
|---|---|---|
| `userId` | Id | Reference to user |
| `issueId` | string | GitHub issue node ID |
| `issueTitle` | string | Issue title |
| `repoName` | string | Repository name |
| `plannedMins` | number | Intended duration |
| `actualMins` | number | Real duration |
| `focusScore` | number | 0–100 score |
| `rawNotes` | string? | User's raw notes |
| `resumeNote` | string? | AI-generated resume note |
| `wasAbandoned` | boolean | Whether session was cut short |
| `completedAt` | number | Unix timestamp |

### `notes`
| Field | Type | Description |
|---|---|---|
| `userId` | Id | Reference to user |
| `issueId` | string | GitHub issue node ID |
| `content` | string | Note content (markdown) |
| `updatedAt` | number | Last saved timestamp |

### `contextCache`
| Field | Type | Description |
|---|---|---|
| `issueId` | string | GitHub issue node ID |
| `data` | any | Cached AI context (JSON) |
| `cachedAt` | number | Cache timestamp (1hr TTL) |

---

## 📦 Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npx convex dev       # Start Convex dev (keep running alongside npm run dev)
npx convex deploy    # Deploy Convex functions to production
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add x"`
4. Push and open a PR

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">
  <p>Built with ⚡ by developers who ship</p>
  <p>
    <a href="https://nextjs.org">Next.js</a> ·
    <a href="https://convex.dev">Convex</a> ·
    <a href="https://console.groq.com">Groq</a> ·
    <a href="https://framer.com/motion">Framer Motion</a>
  </p>
</div>
