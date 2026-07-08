# Swing — Backend API

Backend for **Swing**, the platform that links trainees to trainers, tracks
training progress/certification, and lets admins recommend jobs to certified
trainees.

Built with: **Node.js, Express, MongoDB (Mongoose), JWT auth, Multer, Nodemailer**.

---

## 1. Setup (in VS Code)

1. Open this folder (`swing-backend`) in VS Code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in your MongoDB connection string and a real
   `JWT_SECRET`. If you don't have MongoDB installed locally, create a free
   cluster at https://www.mongodb.com/atlas and paste the connection string
   into `MONGO_URI`.
4. Seed the admin account (creates `admin@gmail.com` / `admin12345@` exactly
   as specified):
   ```bash
   npm run seed
   ```
5. Start the server:
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
├── config/db.js              # MongoDB connection
├── models/                   # User, Job, Notification schemas
├── middleware/
│   ├── auth.js                # JWT verification (protect)
│   ├── roleCheck.js           # Role-based access control (authorize)
│   └── upload.js              # Multer file uploads for skill documents
├── controllers/               # Business logic per role
├── routes/                    # Express routers per role
├── utils/                     # OTP generator, email sender, admin seeder
└── uploads/skills/            # Uploaded trainee skill documents
```

---

## 3. How the roles/permissions map to your spec

- **Registration & OTP**: `POST /api/auth/register` sends a 6-digit OTP,
  valid for `OTP_EXPIRES_MINUTES` (default 10). 3 wrong attempts →
  423/429 lockout for `OTP_LOCK_MINUTES` (default 5), matching your rule.
- **Role selection at registration**: `role` is `"trainee"` or `"trainer"`
  in the register payload. Admin is **not** self-registerable — it's
  seeded once via `npm run seed` with the exact credentials you gave
  (`admin@gmail.com` / `admin12345@`).
- **Strict page/API separation**: every trainee/trainer/admin route is
  behind `protect` (valid JWT) + `authorize('role')`, so a trainer's token
  can never call an admin or trainee endpoint, and vice versa.
- **Trainer bio & skills**: stored on the trainer's own user doc
  (`bio`, `trainerSkills`, `educationStatus`), only exposed via the
  trainer's own profile route and the admin's trainer-detail route — never
  through trainee-facing endpoints.
- **Trainee skills**: `hasSkills` toggles between `skills[]` (with optional
  uploaded documents) or `skillsOfInterest[]`, exactly as described.
- **Training progress → certified**: only the assigned **trainer** can
  flip `trainingStatus` to `certified` (`PUT /api/trainer/trainees/:id/certify`).
- **Admin review pipeline**: pending → assigned (to a trainer) → rejected
  (with a visible comment) are all separate endpoints/statuses.
- **Job recommendations**: admin recommends a job to a *certified* trainee;
  the trainee gets a notification and can then apply.
- **Notifications**: trainers are notified when a trainee is assigned;
  trainees are notified on certification, rejection, and job recommendation.

---

## 4. API reference

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
| GET | `/profile` | Get own profile |
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
| GET | `/trainees/:id` | Full trainee profile |
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

## 5. Connecting your React + Vite frontend

Set your frontend's Axios base URL to `http://localhost:5000/api` and store
the JWT (e.g. in memory or `httpOnly` cookie via a small login wrapper) to
send as `Authorization: Bearer <token>` on every request. Route users to
`/trainee`, `/trainer`, or `/admin` dashboards based on `user.role` returned
from `/api/auth/login` — and never render another role's routes/components
client-side, since the backend also blocks it server-side.
