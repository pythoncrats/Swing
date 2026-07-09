# Swing — Frontend

Frontend for **Swing**, the platform connecting unemployed youth (trainees) with
trainers and employers. Built by Team Fully Charged (Group 25) for the Trinity
2026 Workshop Practice Programme, UCU.

## Stack

- **React + Vite** — app shell and build tooling
- **Tailwind CSS v4** — styling, via `@theme` design tokens in `src/index.css`
- **React Router** — routing and role-based route protection
- **Axios** — pre-wired HTTP client (`src/lib/axios.js`) ready for the real API
- **React Hook Form** — all forms (register, login, profile, jobs)
- **Framer Motion** — page transitions and the signature "Swing Arc" progress visual
- **Lucide React** — icons

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL. To build for production:

```bash
npm run build
npm run preview
```

## No backend yet — how the demo works

There's no API to point at yet, so `src/lib/mockApi.js` stands in for one.
It persists everything to `localStorage` and exposes async functions shaped
exactly like real API calls (`register`, `sendOtp`, `verifyOtp`, `login`,
`assignTraineeToTrainer`, `certifyTrainee`, `recommendJobToTrainee`, etc).
Every page calls these functions, not `localStorage` directly, so hooking up
the real backend later is a matter of swapping the body of each mock
function for an `axios` call through `src/lib/axios.js` — the rest of the
app doesn't need to change.

To wipe the demo data and start fresh, run in the browser console:

```js
localStorage.clear(); location.reload();
```

### Demo accounts

| Role    | Email                          | Password      |
|---------|---------------------------------|---------------|
| Admin   | admin@gmail.com                 | admin12345@   |
| Trainer | grace.trainer@swing.ug          | trainer123    |
| Trainer | peter.trainer@swing.ug          | trainer123    |
| Trainee (pending)     | brian.trainee@example.com   | trainee123 |
| Trainee (in training) | diana.trainee@example.com   | trainee123 |
| Trainee (certified)   | samuel.trainee@example.com  | trainee123 |
| Trainee (rejected)    | faith.trainee@example.com   | trainee123 |

Registering a new account sends a one-time code. Since there's no SMS/email
gateway yet, the code is shown directly on the verification screen (clearly
labelled "demo mode") so the OTP flow — including the 3-attempt limit and
5-minute lockout — can be tested end to end.

## How the spec maps to the code

- **OTP registration, 3-attempt lock** — `src/pages/Register.jsx`,
  `src/pages/VerifyOtp.jsx`, enforced in `src/lib/mockApi.js` (`sendOtp` /
  `verifyOtp`).
- **Role selection at registration, role-locked dashboards** —
  `ProtectedRoute` in `src/routes/ProtectedRoute.jsx` redirects any user to
  their own dashboard if they try to reach another role's routes.
- **Admin login** — same `/login` form; the seeded admin account
  (`admin@gmail.com` / `admin12345@`) logs in like any other user and lands
  on `/admin`.
- **Trainee dashboard** — profile, skills (have/want + document), training
  progress (`SwingArc`), and recommended jobs:
  `src/pages/trainee/TraineeDashboard.jsx`.
- **Trainer dashboard** — editable bio/skills/education profile, trainees
  assigned, certify action, list of trainees certified so far:
  `src/pages/trainer/TrainerDashboard.jsx`.
- **Admin dashboard** — pending review (assign/reject with reason), trainees
  in training, rejected list with reasons, certified trainees + job
  recommendation, trainer directory with full profile + trainee list, and
  job listing CRUD: `src/pages/admin/AdminDashboard.jsx`.
- **Notifications** — trainer notified on new assignment, trainee notified
  on assignment/certification/job recommendation:
  `src/components/layout/NotificationBell.jsx`, generated in `mockApi.js`.

## Structure

```
src/
  components/
    layout/      AppShell (dashboard sidebar), AuthLayout, NotificationBell
    ui/          Button, Field/TextInput/Select, Card, Modal, SwingArc, Logo
  context/       AuthContext (session state)
  lib/           axios.js (real client), mockApi.js (demo backend)
  pages/
    trainee/     TraineeDashboard
    trainer/     TrainerDashboard
    admin/       AdminDashboard
    Landing, Register, VerifyOtp, Login, NotFound
  routes/        ProtectedRoute (role guard)
```
