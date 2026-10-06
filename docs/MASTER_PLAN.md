# Job Application Tracker — Master Plan

Task 3 · ReactTS · CodeTribe Kimberley · Lesson 3 (React Router, URL queries, URL params)

This is the single consolidated planning document. It covers, in order: (1) architecture, (2) step-by-step plan, (3) design file / design spec, (4) pseudo code, (5) algorithms, (6) test plan and submission checklist.

---

## 1. Architecture

### 1.1 Goals

| Requirement from the brief | How the architecture answers it |
|---|---|
| Six pages: Login, Register, Home, Landing, Job details, 404 | One page component per route in `src/pages/` |
| Search / filter / sort reflected in the URL | A single hook, `useJobFilters`, treats the URL query string as the *only* source of truth for these three controls |
| Predictable results when the URL is edited by hand | The hook parses and validates every param; invalid values fall back to defaults |
| URL parameters | `/jobs/:id` and `/jobs/:id/edit` |
| Protected routes | `ProtectedRoute` wrapper (redirects to `/login`, remembers where the user was going) |
| Auth + authorization | `AuthContext` for identity; every job carries a `userId`; the API layer and job page both verify ownership |
| JSON server persistence | `db.json` with `users` and `jobs`; all HTTP in `src/api/` |
| Reusable components, container vs presentational | Pages/hooks = container; `components/` = presentational |
| NavLink for navigation | `Navbar` uses `NavLink` with active styling |
| Notifications and loaders | `ToastContext` (background-process feedback), `Loader`, button "busy" states |
| Responsive at 320/480/768/1024/1200 | Mobile-first plain CSS with those exact breakpoints |
| Accessibility | Semantic landmarks, labelled inputs, `aria-live` toasts, focus styles, 44px touch targets |

### 1.2 Tech stack

- Vite + React 18 + TypeScript
- React Router v6 (`BrowserRouter`, `Routes`, `Route`, `NavLink`, `Navigate`, `Outlet`, `useParams`, `useSearchParams`, `useNavigate`, `useLocation`)
- JSON Server 0.17 (REST on port 3001)
- Plain CSS (one global stylesheet with design tokens as CSS variables)

### 1.3 Folder structure

```
job-application-tracker/
├── db.json                      # JSON server database (users, jobs)
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.example                 # VITE_API_URL
├── README.md
├── docs/MASTER_PLAN.md          # this file
└── src/
    ├── main.tsx                 # entry: providers + router
    ├── App.tsx                  # route table
    ├── index.css                # tokens, layout, components, breakpoints
    ├── types.ts                 # User, Job, JobStatus, SortOrder
    ├── api/
    │   ├── http.ts              # fetch wrapper, error type
    │   ├── users.ts             # register, login lookups
    │   └── jobs.ts              # CRUD
    ├── context/
    │   ├── AuthContext.tsx      # current user, login, register, logout
    │   └── ToastContext.tsx     # push/dismiss notifications
    ├── hooks/
    │   ├── useJobs.ts           # container logic: load, add, update, delete
    │   └── useJobFilters.ts     # URL <-> {q, status, sort}
    ├── utils/
    │   ├── validation.ts        # pure validators
    │   ├── hash.ts              # SHA-256 password hashing
    │   └── format.ts            # dates, status labels
    ├── components/
    │   ├── Layout.tsx           # Navbar + <Outlet/> + Footer
    │   ├── Navbar.tsx
    │   ├── ProtectedRoute.tsx
    │   ├── PublicOnlyRoute.tsx
    │   ├── FormField.tsx
    │   ├── StatusBadge.tsx
    │   ├── JobCard.tsx
    │   ├── JobForm.tsx
    │   ├── Toolbar.tsx          # search + filter + sort controls
    │   ├── StatsBar.tsx
    │   ├── ConfirmDialog.tsx
    │   ├── Loader.tsx
    │   └── ToastViewport.tsx
    └── pages/
        ├── Landing.tsx
        ├── Login.tsx
        ├── Register.tsx
        ├── Home.tsx             # job list (route /jobs)
        ├── JobEditor.tsx        # add + edit (routes /jobs/new, /jobs/:id/edit)
        ├── JobDetails.tsx       # route /jobs/:id
        └── NotFound.tsx
```

### 1.4 Route table

| Path | Page | Access | Notes |
|---|---|---|---|
| `/` | Landing | public | Purpose of the app, call to action. Logged-in users see "Go to my jobs". |
| `/login` | Login | public only | Redirects to `/jobs` if already signed in. Honours `location.state.from`. |
| `/register` | Register | public only | |
| `/jobs` | Home | protected | Query params: `q`, `status`, `sort` |
| `/jobs/new` | JobEditor (create) | protected | Declared before `:id` so "new" is never read as an id |
| `/jobs/:id` | JobDetails | protected + owner | |
| `/jobs/:id/edit` | JobEditor (edit) | protected + owner | |
| `*` | NotFound | public | Catch-all |

### 1.5 URL contract (the part that makes the URL "predictable")

```
/jobs?q=<text>&status=<applied|interviewed|rejected>&sort=<date-desc|date-asc>
```

| Param | Valid values | Default (param omitted from URL) | If invalid |
|---|---|---|---|
| `q` | any string | empty | trimmed; empty means no search |
| `status` | `applied`, `interviewed`, `rejected` (absent = all) | all | ignored, treated as all |
| `sort` | `date-desc`, `date-asc` | `date-desc` | treated as `date-desc` |

Rules:
1. The URL is the single source of truth. Inputs are controlled by what the URL says, not by local state, so refresh, back/forward, and pasting a link all give the same view.
2. Defaults are removed from the URL to keep links clean.
3. Typing in search uses `replace: true` so each keystroke does not add a history entry.
4. Search is matched case-insensitively against company and role.

### 1.6 Data model

```ts
type JobStatus = "applied" | "interviewed" | "rejected";

interface User { id: number; username: string; passwordHash: string; createdAt: string }

interface Job {
  id: number;
  userId: number;            // ownership -> authorization
  company: string;           // required
  role: string;              // required
  status: JobStatus;         // required
  dateApplied: string;       // required, YYYY-MM-DD
  duties: string;            // required
  // optional detail-page fields
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  requirements?: string;
  salary?: string;
  notes?: string;            // interview prep notes
  createdAt: string;
  updatedAt: string;
}
```

### 1.7 State management and data flow

```
 URL (query + params) ─────────────► useJobFilters ──┐
                                                      ▼
 json-server ◄──► api/jobs.ts ◄──► useJobs ──► Home (container)
                                       │            │
                                       │            ├─► Toolbar (presentational)
                                       │            ├─► StatsBar (presentational)
                                       │            └─► JobCard[] (presentational)
 AuthContext ──► ProtectedRoute, Navbar, useJobs (userId)
 ToastContext ──► every mutation reports success/failure
```

- **Server state** (jobs list) lives in `useJobs`, fetched once per user and updated optimistically-after-success (mutate on the server, then update local state).
- **URL state** (q/status/sort) lives only in the URL.
- **Auth state** lives in `AuthContext`; the session (`userId`) is persisted in `localStorage` and re-validated against the server on load.
- **Form state** is local to `JobForm` / `Login` / `Register`.

### 1.8 Authentication and authorization

- Registration: validate, check username not taken (`GET /users?username=`), hash password with SHA-256, `POST /users`.
- Login: look up by username, compare hash, store `userId` in `localStorage`.
- Session restore on page load: read `userId`, `GET /users/:id`, and only then render protected routes (a `loading` flag prevents a flash-redirect to `/login`).
- Authorization: `getJobs(userId)` only requests that user's jobs; `JobDetails` / `JobEditor` fetch the job and show the 404 view if `job.userId !== user.id`. Update/delete call a pre-check.
- **Honest limitation:** JSON server has no real security. Anyone who can reach port 3001 can read `db.json`. Hashing and ownership checks make this a realistic MVP, but a production app needs a real backend with sessions or JWTs. This is stated in the README.

---

## 2. Step-by-step plan

| # | Step | Output | Done when |
|---|---|---|---|
| 1 | Create repo, feature branch `feature/task-3-job-tracker` | Git branch | Branch pushed |
| 2 | Scaffold Vite React TS, install `react-router-dom`, `json-server@0.17.4`, `concurrently` | Running dev server | Blank page renders |
| 3 | Write `db.json` and confirm `GET /jobs` works | JSON server up | curl returns data |
| 4 | Types, validation utils, hash util | `types.ts`, `utils/` | Unit-style console checks pass |
| 5 | API layer (`http`, `users`, `jobs`) | `api/` | Functions typed, errors normalised |
| 6 | `AuthContext` + `ToastContext` | Providers | Login/logout works from console |
| 7 | Router skeleton with all six pages as stubs, `Layout`, `Navbar` with `NavLink` | Navigable shell | Every route reachable; unknown path shows 404 |
| 8 | `ProtectedRoute` and `PublicOnlyRoute` | Guarded routes | Logged-out `/jobs` redirects to `/login` and returns after login |
| 9 | Register + Login pages with validation | Working auth | New user can sign up and log in |
| 10 | `useJobs` hook + Home list + `JobCard` + `StatusBadge` | Read | Jobs for the user display |
| 11 | `JobForm` + `JobEditor` (create + edit) | Create, Update | Add and edit persist to `db.json` |
| 12 | Delete with `ConfirmDialog` | Delete | Job removed from list and file |
| 13 | `useJobFilters` + `Toolbar` | Search, filter, sort | URL changes with each control; manual URL edits work |
| 14 | `JobDetails` page using `:id` | Detail view | Valid id shows job; bad/foreign id shows 404 |
| 15 | Landing page | Marketing page | Explains purpose, links to register/login |
| 16 | Loaders, button busy states, toasts, empty states | Feedback | Every async action gives feedback |
| 17 | Responsive pass at 320/480/768/1024/1200 | CSS | No horizontal scroll at any width |
| 18 | Accessibility pass | Labels, focus, aria | Keyboard-only walkthrough works |
| 19 | README, final test pass, commit, push, PR to `main`, assign mentor, submit form | Submission | PR open before 07 Oct 09:00 |

---

## 3. Design file (design spec)

If your course requires a Figma file, build it from these specs; the numbers below are exactly what the CSS uses.

### 3.1 Design principles
Calm, high-contrast, and quick to scan. Status is communicated by colour **and** text label (never colour alone).

### 3.2 Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0F172A` | Page background (deep navy) |
| `--surface` | `#1E293B` | Cards, forms, navbar |
| `--surface-2` | `#273449` | Inputs, hover surfaces |
| `--border` | `#334155` | Dividers, input borders |
| `--text` | `#F1F5F9` | Primary text |
| `--muted` | `#A8B5C8` | Secondary text |
| `--primary` | `#6366F1` | Primary buttons, links, focus ring |
| `--primary-hover` | `#818CF8` | Hover |
| `--applied` | `#FACC15` | Status: Applied (yellow) |
| `--interviewed` | `#4ADE80` | Status: Interviewed (green) |
| `--rejected` | `#F87171` | Status: Rejected (red) |
| `--danger` | `#EF4444` | Delete actions |

Contrast: `--text` on `--bg` is above 14:1; status colours on `--surface` are all above 7:1.

### 3.3 Typography
System UI stack (`Inter`, `Segoe UI`, `system-ui`, sans-serif). Scale: 14 / 16 / 20 / 24 / 32 / 44 px. Body 16px minimum (no zoom on iOS inputs). Headings 600–700 weight.

### 3.4 Spacing and shape
8px base grid: 4, 8, 12, 16, 24, 32, 48. Radius: 8px inputs and buttons, 14px cards, 999px badges. Minimum interactive height 44px.

### 3.5 Layouts per page

- **Landing:** hero (headline, subtext, two buttons) → three feature cards → "how it works" 3 steps → footer.
- **Login / Register:** centred card, max 420px, stacked fields, inline error text under each field, link to the other form.
- **Home (`/jobs`):** page header with "Add job" button → stats bar (Total, Applied, Interviewed, Rejected) → toolbar (search, status filter, sort) → card grid (1 col at <768, 2 cols at 768+, 3 cols at 1200+) → empty state when nothing matches.
- **Job details:** back link → title block with status badge → two-column grid (Overview + Contact on one side, Duties + Requirements + Notes on the other; single column on mobile) → Edit / Delete actions.
- **Editor:** single-column form, required fields first, optional section ("More details") below.
- **404:** large "404", short message, button back to home.

### 3.6 Breakpoints

| Width | Behaviour |
|---|---|
| 320 | Single column, navbar collapses to a menu button, buttons full width |
| 480 | Slightly larger padding, stats bar becomes 2×2 |
| 768 | Navbar inline, card grid 2 columns, toolbar in one row |
| 1024 | Wider container (960px), details page two columns |
| 1200 | Container 1120px, card grid 3 columns |

### 3.7 Interaction states
- Hover: buttons lighten, cards lift 2px with border highlight, `cursor: pointer` on all clickable elements.
- Focus: 3px visible ring in `--primary-hover`.
- Active/busy: button text switches to "Saving…" with a spinner and `disabled`.
- Loading: spinner with `role="status"`.
- Toasts: bottom-right (bottom-centre on mobile), auto-dismiss after 4s, `aria-live="polite"`.

---

## 4. Pseudo code

### 4.1 App bootstrap
```
render <BrowserRouter>
  <ToastProvider>
    <AuthProvider>
      <App/>

App routes:
  Layout (Navbar + Outlet + Footer)
    "/"                 -> Landing
    PublicOnlyRoute
      "/login"          -> Login
      "/register"       -> Register
    ProtectedRoute
      "/jobs"           -> Home
      "/jobs/new"       -> JobEditor(mode=create)
      "/jobs/:id"       -> JobDetails
      "/jobs/:id/edit"  -> JobEditor(mode=edit)
    "*"                 -> NotFound
```

### 4.2 AuthProvider
```
state: user = null, loading = true

on mount:
  id = localStorage.get("jt_session")
  if id is empty: loading = false; stop
  try  user = GET /users/id
  catch  localStorage.remove("jt_session")
  loading = false

register(username, password):
  existing = GET /users?username=username   (case-insensitive check)
  if existing not empty: throw "Username already taken"
  created = POST /users { username, passwordHash: sha256(password), createdAt }
  setSession(created)

login(username, password):
  matches = GET /users?username=username
  user = matches where hash equals sha256(password)
  if none: throw "Incorrect username or password"   // same message for both cases
  setSession(user)

logout():
  localStorage.remove("jt_session"); user = null
```

### 4.3 ProtectedRoute
```
if auth.loading: return <Loader/>
if no auth.user: return <Navigate to="/login" state={from: currentLocation} replace/>
return <Outlet/>
```

### 4.4 Validation
```
validateRegister({username, password, confirm}):
  errors = {}
  username trimmed: required, 3..20 chars, only letters/digits/_/.
  password: required, >= 8 chars, has a letter and a digit
  confirm: must equal password
  return errors

validateJob(values):
  company: required, <= 80
  role: required, <= 80
  status: one of the three values
  dateApplied: required, valid date, not in the future
  duties: required, >= 10 chars
  contactEmail: if present, matches simple email pattern
  contactPhone: if present, only digits, spaces, + - ( )
  website: if present, starts with http:// or https:// and parses as URL
  return errors
```

### 4.5 useJobFilters (URL <-> view state)
```
[params, setParams] = useSearchParams()

q      = (params.get("q") ?? "").trim()
status = params.get("status") in VALID_STATUSES ? that : "all"
sort   = params.get("sort") == "date-asc" ? "date-asc" : "date-desc"

update({q?, status?, sort?}):
  next = copy of params
  for each provided key:
    if value equals the default ("" / "all" / "date-desc"): next.delete(key)
    else next.set(key, value)
  setParams(next, replace = true)

clear(): setParams({}, replace = true)
```

### 4.6 Applying filters to the list
```
function applyView(jobs, {q, status, sort}):
  needle = lowercase(q)
  result = jobs
    .filter(j => status == "all" or j.status == status)
    .filter(j => needle == "" or lowercase(j.company) contains needle
                              or lowercase(j.role) contains needle)
  result.sort by dateApplied (ISO strings compare correctly),
    tie-break on id so order is stable
  if sort == "date-desc": reverse the comparison
  return result
```

### 4.7 useJobs
```
state: jobs = [], loading = true, error = null

load():
  loading = true
  jobs = GET /jobs?userId=user.id
  on error: error = message; toast(error)
  loading = false

add(values):   created = POST /jobs {...values, userId, createdAt, updatedAt}; jobs.push(created)
update(id, v): saved   = PATCH /jobs/id {...v, updatedAt}; replace in jobs
remove(id):    DELETE /jobs/id; jobs = jobs without id

each mutation: try -> toast success; catch -> toast error and rethrow so the form can stay open
```

### 4.8 Home page
```
view = applyView(jobs, filters)
counts = number of jobs per status (from the full list, not the filtered one)

render:
  header + "Add job" link to /jobs/new
  StatsBar(counts)
  Toolbar(filters, onChange = update)
  if loading: Loader
  else if jobs is empty: empty state "No applications yet"
  else if view is empty: empty state "Nothing matches" + "Clear filters"
  else grid of JobCard(job, onDelete -> open ConfirmDialog)

on confirm delete: await remove(id); close dialog
```

### 4.9 JobDetails
```
{id} = useParams()
job = lookup in loaded jobs, else GET /jobs/id
if loading: Loader
if not found or job.userId != user.id: render <NotFound inline/>
render all fields, optional fields only when present, Edit link, Delete button
```

### 4.10 JobEditor
```
mode = id ? "edit" : "create"
if edit: load job (same ownership rule as 4.9) and pre-fill form
onSubmit(values):
  errors = validateJob(values)
  if errors: show them, focus first invalid field, stop
  busy = true
  create -> add(values)   edit -> update(id, values)
  navigate("/jobs" or "/jobs/id")
  busy = false
```

---

## 5. Algorithms (numbered, language-neutral)

### 5.1 Login with return-to
1. User opens `/jobs/7` while logged out.
2. `ProtectedRoute` sees no user and redirects to `/login`, passing `from = /jobs/7` in router state.
3. User submits valid credentials; `login()` succeeds.
4. Login page navigates to `from` if it exists, otherwise `/jobs`.

### 5.2 Search, filter, sort
1. Read `q`, `status`, `sort` from the URL and normalise (section 1.5).
2. Keep jobs whose status matches (or all).
3. Keep jobs where company or role contains the search text (case-insensitive).
4. Sort by `dateApplied`, then `id`, in the chosen direction.
5. Render. Any control change rewrites the URL (step 1 then re-runs), so view and URL can never disagree.

### 5.3 Delete
1. User clicks Delete; dialog opens with the company and role.
2. Cancel closes the dialog. Confirm sets the button to busy.
3. `DELETE /jobs/:id`. On success remove it from state, close the dialog, toast "Deleted". On failure keep the job, show an error toast.

### 5.4 Ownership check
1. Fetch job by id.
2. If the request fails with 404, show NotFound.
3. If `job.userId` differs from the logged-in user, show NotFound (not "forbidden", so the existence of other users' jobs is not revealed).

---

## 6. Test plan and submission checklist

### 6.1 Manual test cases

| # | Scenario | Expected |
|---|---|---|
| 1 | Open `/jobs` logged out | Redirect to `/login`; after login returns to `/jobs` |
| 2 | Register with existing username | Error under username field |
| 3 | Register with weak password | Inline password error |
| 4 | Wrong password on login | Generic "Incorrect username or password" |
| 5 | Add job with empty fields | Inline errors, nothing saved |
| 6 | Add job with future date | Date error |
| 7 | Add valid job | Toast, appears in list, present in `db.json` |
| 8 | Edit job and change status | Badge colour changes |
| 9 | Delete job, cancel | Nothing deleted |
| 10 | Delete job, confirm | Removed from list and `db.json` |
| 11 | Type in search | URL gains `?q=`; refresh keeps the result |
| 12 | Filter by status | URL gains `status=`; badge counts unchanged |
| 13 | Sort ascending | URL gains `sort=date-asc` |
| 14 | Edit URL by hand to `?status=banana&sort=zzz` | Treated as defaults, no crash |
| 15 | Open `/jobs/99999` | 404 view |
| 16 | Log in as user B and open user A's job URL | 404 view |
| 17 | Open `/nonsense` | 404 page |
| 18 | Resize 320 → 1200 | No horizontal scroll, layout per section 3.6 |
| 19 | Keyboard only | All actions reachable, focus visible |
| 20 | Stop JSON server, load `/jobs` | Error toast and retry option |

### 6.2 Submission checklist
- [ ] Work on a feature branch, small meaningful commits
- [ ] README with setup, scripts, routes, URL contract, limitations
- [ ] Both servers start with `npm run dev`
- [ ] Push to GitHub
- [ ] Pull request to `main`, mentor assigned
- [ ] Submission form completed before **07 October, 09:00**
- [ ] Design file, planning, pseudo code, algorithm, and implementation all attached or linked (this document covers the planning, pseudo code, and algorithm items)
