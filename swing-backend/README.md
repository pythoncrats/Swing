# Swing — Backend API (MySQL)

Backend for **Swing**, the platform that links trainees to trainers, tracks
training progress/certification, and lets admins recommend jobs to certified
trainees.

Built with: **Node.js, Express, MySQL (mysql2), JWT auth, Multer, Nodemailer**.

---

## 1. Setup (in VS Code)

1. Make sure MySQL Server is installed and running locally (or you have
   access to a remote MySQL instance).
2. Open this folder (`swing-backend`) in VS Code.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create the database and all tables by running the schema file:
   ```bash
   mysql -u root -p < sql/schema.sql
   ```
   This creates the `swing` database and every table (`users`,
   `trainee_skills`, `jobs`, `recommended_jobs`, `applied_jobs`,
   `notifications`). See `sql/schema.sql` for the full definitions and
   `sql/queries.sql` for handy reference queries you can run manually.
5. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in your MySQL credentials (`DB_HOST`,
   `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and a real `JWT_SECRET`.
6. Seed the admin account (creates `admin@gmail.com` / `admin12345@`
   exactly as specified):
   ```bash
   npm run seed
   ```
7. Start the server:
   ```bash
   npm run dev
   ```
   The API will run at `http://localhost:5000`.

> **Email/OTP note:** If you don't configure `SMTP_HOST` / `SMTP_USER` /
> `SMTP_PASS` in `.env`, OTP codes are printed to the terminal instead of
> emailed — handy for development. Fill those in (e.g. with a Gmail App
> Password) to actually send OTP emails.

---

## 2. Project structure

```
swing-backend/
├── server.js                 # App entry point
├── sql/
│   ├── schema.sql             # CREATE DATABASE + all CREATE TABLE statements
│   └── queries.sql            # Reference/standalone SQL queries for manual use
├── config/db.js               # MySQL connection pool (mysql2/promise)
├── models/                    # Raw SQL query functions per table (User, Job, Notification)
├── middleware/
│   ├── auth.js                 # JWT verification (protect)
│   ├── roleCheck.js            # Role-based access control (authorize)
│   └── upload.js               # Multer file uploads for skill documents
├── controllers/                # Business logic per role
├── routes/                     # Express routers per role
├── utils/                      # OTP generator, email sender, admin seeder
└── uploads/skills/             # Uploaded trainee skill documents
```

---

## 3. Database tables

| Table | Purpose |
|---|---|
| `users` | All three roles (trainee/trainer/admin) in one table; role-specific columns are NULL for roles that don't use them |
| `trainee_skills` | One row per skill a trainee has (with optional uploaded proof document) |
| `jobs` | Job/company openings created by admins |
| `recommended_jobs` | Junction table: which jobs were recommended to which trainees |
| `applied_jobs` | Junction table: which trainees applied to which jobs |
| `notifications` | In-app notifications for all roles |

Full column definitions, types, and foreign keys are in `sql/schema.sql`.

---

## 4. How the roles/permissions map to your spec

- **Registration & OTP**: `POST /api/auth/register` sends a 6-digit OTP,
  valid for `OTP_EXPIRES_MINUTES` (default 10). 3 wrong attempts →
  429 lockout for `OTP_LOCK_MINUTES` (default 5), matching your rule.
- **Role selection at registration**: `role` is `"trainee"` or `"trainer"`
  in the register payload. Admin is **not** self-registerable — it's
  seeded once via `npm run seed` with the exact credentials you gave
  (`admin@gmail.com` / `admin12345@`).
- **Strict page/API separation**: every trainee/trainer/admin route is
  behind `protect` (valid JWT) + `authorize('role')`, so a trainer's token
  can never call an admin or trainee endpoint, and vice versa.
- **Trainer bio & skills**: stored on the trainer's own row
  (`bio`, `trainer_skills`, `education_status`), only exposed via the
  trainer's own profile route and the admin's trainer-detail route — never
  through trainee-facing endpoints.
- **Trainee skills**: `has_skills` toggles between rows in `trainee_skills`
  (with optional uploaded documents) or the `skills_of_interest` JSON
  column, exactly as described.
- **Training progress → certified**: only the assigned **trainer** can
  flip `training_status` to `certified` (`PUT /api/trainer/trainees/:id/certify`).
- **Admin review pipeline**: pending → assigned (to a trainer) → rejected
  (with a visible comment) are all separate endpoints/statuses.
- **Job recommendations**: admin recommends a job to a *certified* trainee;
  the trainee gets a notification and can then apply.
- **Notifications**: trainers are notified when a trainee is assigned;
  trainees are notified on certification, rejection, and job recommendation.

---

## 5. API reference

All protected routes require header: `Authorization: Bearer <token>`

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register as trainee or trainer, triggers OTP |
| POST | `/verify-otp` | Public | Verify OTP, returns JWT on success |
| POST | `/resend-otp` | Public | Resend OTP code |
| POST | `/login` | Public | Login (trainee, trainer, or admin) |
| GET  | `/me` | Any logged-in user | Get your own profile |

### Trainee (`/api/trainee`) — role: trainee
| Method | Route | Description |
|---|---|---|
| GET | `/profile` | Get own profile (includes skills) |
| PUT | `/profile` | Update name/phone/location |
| PUT | `/skills` | Set hasSkills + skills or skillsOfInterest (multipart for docs) |
| GET | `/status` | Registration + training status |
| GET | `/jobs` | Jobs recommended to you |
| POST | `/jobs/:jobId/apply` | Apply to a recommended job |
| GET | `/notifications` | Your notifications |

### Trainer (`/api/trainer`) — role: trainer
| Method | Route | Description |
|---|---|---|
| GET | `/profile` | Get own profile |
| PUT | `/profile` | Update bio, skills, education, contact info |
| GET | `/trainees` | Trainees assigned to you |
| GET | `/trainees/certified` | Trainees you've certified |
| PUT | `/trainees/:id/progress` | Mark a trainee as in-progress |
| PUT | `/trainees/:id/certify` | Certify a trainee |
| GET | `/notifications` | Your notifications |

### Admin (`/api/admin`) — role: admin
| Method | Route | Description |
|---|---|---|
| GET | `/trainees/pending` | Trainees awaiting confirmation |
| GET | `/trainees/assigned` | Trainees assigned to trainers |
| GET | `/trainees/rejected` | Rejected trainees (with reasons) |
| GET | `/trainees/certified` | Certified trainees |
| GET | `/trainees/in-training` | Trainees still training |
| GET | `/trainees/:id` | Full trainee profile (skills + recommended jobs) |
| PUT | `/trainees/:id/assign` | `{ trainerId }` — assign trainer |
| PUT | `/trainees/:id/reject` | `{ reason }` — reject with comment |
| PUT | `/trainees/:id/recommend-job` | `{ jobId }` — recommend job to certified trainee |
| GET | `/trainers` | List all trainers |
| GET | `/trainers/:id` | Trainer profile + their trainees |
| GET | `/jobs` | List all jobs |
| POST | `/jobs` | Create a job posting |
| PUT | `/jobs/:id` | Edit a job posting |
| DELETE | `/jobs/:id` | Remove a job posting |

---

## 6. Connecting your React + Vite frontend

Set your frontend's Axios base URL to `http://localhost:5000/api` and store
the JWT (e.g. in memory or `httpOnly` cookie via a small login wrapper) to
send as `Authorization: Bearer <token>` on every request. Route users to
`/trainee`, `/trainer`, or `/admin` dashboards based on `user.role` returned
from `/api/auth/login` — and never render another role's routes/components
client-side, since the backend also blocks it server-side.
