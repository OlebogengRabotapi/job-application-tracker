# JobTrack — Job Application Tracker

Task 3 · ReactTS · CodeTribe Kimberley (Lesson 3: React Router, URL queries and URL parameters)

A small MVP web app that lets job seekers record the jobs they've applied for and see how many are pending (Applied), successful (Interviewed) or rejected. Built with Vite, React 18, TypeScript, React Router v6, plain CSS and JSON Server.

## Features

- Six pages: **Landing, Register, Login, Home (My jobs), Job details, 404**
- Register and log in with username + password, with full form validation
- **Protected routes**: signed-out users are redirected to `/login` and returned to the page they wanted after signing in
- **Authorization**: every job belongs to a user; you can only view, edit or delete your own jobs
- **CRUD**: add, view, edit and delete jobs (company, role, status, date applied, duties, plus optional address, website, contact details, salary, requirements and interview notes)
- **Search** by company or role, **filter** by status, **sort** by date (newest/oldest). All three live in the URL
- Status colours **and** text labels: yellow = Applied, green = Interviewed, red = Rejected
- Loaders, disabled/"Saving…" button states, toast notifications and a delete confirmation dialog
- Responsive at 320, 480, 768, 1024 and 1200px; keyboard and screen-reader friendly

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

`npm run dev` starts both servers:

| Server | URL |
|---|---|
| App (Vite) | http://localhost:5173 |
| API (JSON Server) | http://localhost:3001 |

Other scripts: `npm run web` (app only), `npm run api` (API only), `npm run build`, `npm run preview`, `npm run typecheck`.

To point the app at a different API, copy `.env.example` to `.env` and change `VITE_API_URL`.

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | Landing | public |
| `/register` | Register | public only (signed-in users go to `/jobs`) |
| `/login` | Login | public only |
| `/jobs` | Home — list, search, filter, sort | protected |
| `/jobs/new` | Add job | protected |
| `/jobs/:id` | Job details (URL parameter) | protected, owner only |
| `/jobs/:id/edit` | Edit job | protected, owner only |
| `*` | 404 | public |

## URL contract (search, filter, sort)

```
/jobs?q=<text>&status=<applied|interviewed|rejected>&sort=<date-desc|date-asc>
```

| Param | Valid values | Default (omitted from URL) | Invalid value |
|---|---|---|---|
| `q` | any text (matches company or role, case-insensitive) | empty | trimmed |
| `status` | `applied`, `interviewed`, `rejected` | all statuses | treated as all |
| `sort` | `date-desc`, `date-asc` | `date-desc` | treated as `date-desc` |

Examples:

- `/jobs?status=interviewed`
- `/jobs?q=developer&sort=date-asc`
- `/jobs?q=google&status=rejected`

The URL is the single source of truth, so refreshing, using the back button, or pasting a link always gives the same view, and hand-edited URLs with bad values fall back to defaults instead of breaking.

## Project structure

```
src/
  api/          fetch wrapper + users/jobs REST calls
  context/      AuthContext (session) and ToastContext (notifications)
  hooks/        useJobs (data + CRUD), useJob (one job from :id), useJobFilters (URL <-> view)
  components/   reusable presentational components (JobCard, JobForm, Toolbar, StatusBadge, ...)
  pages/        one component per route
  utils/        validation, formatting, password hashing
  index.css     design tokens, components, breakpoints
docs/MASTER_PLAN.md   architecture, step-by-step plan, design spec, pseudo code, algorithms, test plan
```

Container vs presentational: pages and hooks (`Home`, `JobEditor`, `useJobs`) own data and URL state; components (`JobCard`, `Toolbar`, `StatsBar`, `JobForm`) receive props and report changes through callbacks.

## Data (db.json)

```
users: { id, username, passwordHash, createdAt }
jobs:  { id, userId, company, role, status, dateApplied, duties,
         address?, contactName?, contactEmail?, contactPhone?, website?,
         requirements?, salary?, notes?, createdAt, updatedAt }
```

`db.json` is committed empty. JSON Server writes new users and jobs into it while you use the app.

## Known limitations (mock app)

- JSON Server has no real security: anyone who can reach port 3001 can read `db.json`. Passwords are hashed with SHA-256 in the browser so they are not stored in plain text, and ownership checks run in the client, but a production app needs a real backend with salted password hashing (bcrypt/argon2), sessions or JWTs, and server-side authorization.
- The session is a user id kept in `localStorage`.

## Manual test checklist

See section 6 of `docs/MASTER_PLAN.md` (20 scenarios covering auth, validation, CRUD, URL state, 404s, responsiveness and keyboard use).

## Git workflow for submission

```bash
git checkout -b feature/task-3-job-tracker
git add .
git commit -m "Add job application tracker"
git push -u origin feature/task-3-job-tracker
# open a pull request into main, assign your mentor, then complete the submission form
```
