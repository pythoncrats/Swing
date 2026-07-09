// mockApi.js
// Stands in for the real Swing backend so the frontend is fully demoable
// without a server. Everything is persisted to localStorage, keyed under
// SWING_DB_KEY, and reset with resetDemoData() below. Every exported
// function is async and shaped like it would be if it were a real HTTP
// call through src/lib/axios.js, so swapping later is a one-line change
// per call site.

const SWING_DB_KEY = "swing_db_v1";
const OTP_TTL_MS = 5 * 60 * 1000; // otp valid 5 min
const OTP_LOCK_MS = 5 * 60 * 1000; // lock 5 min after 3 failed attempts
const MAX_OTP_ATTEMPTS = 3;

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms));
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => Date.now();

function seedData() {
  const trainerBio1 =
    "I train young people in modern web development so they can build real products, not just follow tutorials.";
  const trainerBio2 =
    "I run the tailoring and fashion design track, focused on skills trainees can turn into income within months.";

  const users = [
    {
      id: "u-admin",
      role: "admin",
      name: "System Admin",
      email: "admin@gmail.com",
      password: "admin12345@",
      phone: "+256700000000",
      createdAt: now(),
    },
    {
      id: "u-trainer-1",
      role: "trainer",
      name: "Grace Nakato",
      email: "grace.trainer@swing.ug",
      password: "trainer123",
      phone: "+256701234567",
      education: "BSc. Computer Science, Makerere University",
      bio: trainerBio1,
      skills: ["Web Development", "UI/UX Design", "Git & GitHub"],
      createdAt: now(),
    },
    {
      id: "u-trainer-2",
      role: "trainer",
      name: "Peter Okello",
      email: "peter.trainer@swing.ug",
      password: "trainer123",
      phone: "+256709876543",
      education: "Diploma in Fashion & Design, Nakawa Vocational Institute",
      bio: trainerBio2,
      skills: ["Tailoring", "Fashion Design", "Pattern Cutting"],
      createdAt: now(),
    },
    {
      id: "u-trainee-1",
      role: "trainee",
      name: "Brian Kato",
      email: "brian.trainee@example.com",
      password: "trainee123",
      phone: "+256711111111",
      location: "Mukono, Uganda",
      status: "pending",
      hasSkills: false,
      skillsHave: [],
      skillsWanted: ["Graphic Design"],
      documents: [],
      assignedTrainerId: null,
      rejectionReason: null,
      createdAt: now(),
    },
    {
      id: "u-trainee-2",
      role: "trainee",
      name: "Diana Namuli",
      email: "diana.trainee@example.com",
      password: "trainee123",
      phone: "+256722222222",
      location: "Kampala, Uganda",
      status: "in_training",
      hasSkills: true,
      skillsHave: ["Basic HTML", "Basic CSS"],
      skillsWanted: [],
      documents: ["diana_certificate_o_level.pdf"],
      assignedTrainerId: "u-trainer-1",
      rejectionReason: null,
      createdAt: now(),
    },
    {
      id: "u-trainee-3",
      role: "trainee",
      name: "Samuel Ouma",
      email: "samuel.trainee@example.com",
      password: "trainee123",
      phone: "+256733333333",
      location: "Jinja, Uganda",
      status: "certified",
      hasSkills: true,
      skillsHave: ["Tailoring Basics"],
      skillsWanted: [],
      documents: ["samuel_id_copy.pdf"],
      assignedTrainerId: "u-trainer-2",
      rejectionReason: null,
      createdAt: now(),
    },
    {
      id: "u-trainee-4",
      role: "trainee",
      name: "Faith Achen",
      email: "faith.trainee@example.com",
      password: "trainee123",
      phone: "+256744444444",
      location: "Mukono, Uganda",
      status: "rejected",
      hasSkills: false,
      skillsHave: [],
      skillsWanted: ["Web Development"],
      documents: [],
      assignedTrainerId: null,
      rejectionReason:
        "Incomplete contact details provided at registration. Please re-apply with a reachable phone number.",
      createdAt: now(),
    },
  ];

  const jobs = [
    {
      id: "j-1",
      title: "Junior Frontend Developer",
      company: "Kampala Tech Hub",
      location: "Kampala, Uganda",
      description:
        "Build and maintain UI for internal tools using React. Great fit for recently certified web development trainees.",
      postedAt: now(),
    },
    {
      id: "j-2",
      title: "Tailoring Assistant",
      company: "Nile Fashion House",
      location: "Jinja, Uganda",
      description:
        "Support senior tailors with cutting, stitching and finishing for a growing made-to-order fashion label.",
      postedAt: now(),
    },
    {
      id: "j-3",
      title: "Graphic Design Intern",
      company: "Mukono Creatives",
      location: "Mukono, Uganda",
      description:
        "Design social media graphics and simple brand assets for local small businesses.",
      postedAt: now(),
    },
  ];

  const recommendations = [
    {
      id: "r-1",
      traineeId: "u-trainee-3",
      jobId: "j-2",
      recommendedAt: now(),
      applied: false,
    },
  ];

  const notifications = [
    {
      id: "n-1",
      userId: "u-trainer-1",
      message: "A new trainee, Diana Namuli, has been assigned to you.",
      read: false,
      createdAt: now(),
    },
    {
      id: "n-2",
      userId: "u-trainee-3",
      message: "You've been recommended for a Tailoring Assistant role at Nile Fashion House.",
      read: false,
      createdAt: now(),
    },
  ];

  return { users, jobs, recommendations, notifications, otps: {} };
}

function readDb() {
  const raw = localStorage.getItem(SWING_DB_KEY);
  if (!raw) {
    const seeded = seedData();
    localStorage.setItem(SWING_DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const seeded = seedData();
    localStorage.setItem(SWING_DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeDb(db) {
  localStorage.setItem(SWING_DB_KEY, JSON.stringify(db));
}

export function resetDemoData() {
  localStorage.removeItem(SWING_DB_KEY);
  localStorage.removeItem("swing_token");
  localStorage.removeItem("swing_current_user");
  readDb();
}

class ApiError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

/* ------------------------------- AUTH -------------------------------- */

export async function sendOtp({ email, purpose = "register" }) {
  await delay();
  const db = readDb();

  if (purpose === "register" && db.users.some((u) => u.email === email)) {
    throw new ApiError("An account with this email already exists.", "email");
  }

  const existing = db.otps[email];
  if (existing?.lockUntil && existing.lockUntil > now()) {
    const secs = Math.ceil((existing.lockUntil - now()) / 1000);
    throw new ApiError(`Too many attempts. Try again in ${Math.ceil(secs / 60)} minute(s).`);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  db.otps[email] = {
    code,
    attempts: 0,
    expiresAt: now() + OTP_TTL_MS,
    lockUntil: null,
  };
  writeDb(db);

  // No SMS/email gateway in this demo build - the code is "delivered"
  // straight back to the caller so the UI can surface it for testing.
  return { devOtp: code, expiresInSeconds: OTP_TTL_MS / 1000 };
}

export async function verifyOtp({ email, code }) {
  await delay();
  const db = readDb();
  const record = db.otps[email];

  if (!record) throw new ApiError("Request a code first.");
  if (record.lockUntil && record.lockUntil > now()) {
    const secs = Math.ceil((record.lockUntil - now()) / 1000);
    throw new ApiError(`Too many attempts. Try again in ${Math.ceil(secs / 60)} minute(s).`);
  }
  if (record.expiresAt < now()) {
    throw new ApiError("This code has expired. Request a new one.");
  }

  if (record.code !== code) {
    record.attempts += 1;
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      record.lockUntil = now() + OTP_LOCK_MS;
      writeDb(db);
      throw new ApiError(
        `Incorrect code. You've used all ${MAX_OTP_ATTEMPTS} attempts — wait 5 minutes and start registration again.`
      );
    }
    writeDb(db);
    throw new ApiError(
      `Incorrect code. ${MAX_OTP_ATTEMPTS - record.attempts} attempt(s) left.`
    );
  }

  delete db.otps[email];
  writeDb(db);
  return { verified: true };
}

export async function register({ role, name, email, phone, password, location }) {
  await delay();
  const db = readDb();
  if (db.users.some((u) => u.email === email)) {
    throw new ApiError("An account with this email already exists.", "email");
  }

  const base = {
    id: uid(role),
    role,
    name,
    email,
    phone,
    password,
    createdAt: now(),
  };

  const user =
    role === "trainee"
      ? {
          ...base,
          location: location || "",
          status: "pending",
          hasSkills: false,
          skillsHave: [],
          skillsWanted: [],
          documents: [],
          assignedTrainerId: null,
          rejectionReason: null,
        }
      : {
          ...base,
          bio: "",
          skills: [],
          education: "",
        };

  db.users.push(user);
  writeDb(db);

  return sanitizeUser(user);
}

export async function login({ email, password }) {
  await delay();
  const db = readDb();
  const user = db.users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    throw new ApiError("Incorrect email or password.");
  }
  const token = uid("token");
  localStorage.setItem("swing_token", token);
  const clean = sanitizeUser(user);
  localStorage.setItem("swing_current_user", JSON.stringify(clean));
  return clean;
}

export async function logout() {
  await delay(150);
  localStorage.removeItem("swing_token");
  localStorage.removeItem("swing_current_user");
}

export function getSessionUser() {
  const raw = localStorage.getItem("swing_current_user");
  return raw ? JSON.parse(raw) : null;
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function refreshSession(userId) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (user) localStorage.setItem("swing_current_user", JSON.stringify(sanitizeUser(user)));
}

/* ------------------------------ TRAINEE -------------------------------- */

export async function updateTraineeProfile(traineeId, patch) {
  await delay();
  const db = readDb();
  const user = db.users.find((u) => u.id === traineeId);
  if (!user) throw new ApiError("Trainee not found.");
  Object.assign(user, patch);
  writeDb(db);
  refreshSession(traineeId);
  return sanitizeUser(user);
}

export async function updateTraineeSkills(traineeId, { hasSkills, skillsHave, skillsWanted, documents }) {
  return updateTraineeProfile(traineeId, { hasSkills, skillsHave, skillsWanted, documents });
}

export async function getRecommendedJobs(traineeId) {
  await delay();
  const db = readDb();
  const recs = db.recommendations.filter((r) => r.traineeId === traineeId);
  return recs.map((r) => ({ ...r, job: db.jobs.find((j) => j.id === r.jobId) }));
}

export async function applyToRecommendation(recommendationId) {
  await delay();
  const db = readDb();
  const rec = db.recommendations.find((r) => r.id === recommendationId);
  if (!rec) throw new ApiError("Recommendation not found.");
  rec.applied = true;
  writeDb(db);
  return rec;
}

/* ------------------------------ TRAINER -------------------------------- */

export async function updateTrainerProfile(trainerId, patch) {
  await delay();
  const db = readDb();
  const user = db.users.find((u) => u.id === trainerId);
  if (!user) throw new ApiError("Trainer not found.");
  Object.assign(user, patch);
  writeDb(db);
  refreshSession(trainerId);
  return sanitizeUser(user);
}

export async function getAssignedTrainees(trainerId) {
  await delay();
  const db = readDb();
  return db.users
    .filter((u) => u.role === "trainee" && u.assignedTrainerId === trainerId && u.status === "in_training")
    .map(sanitizeUser);
}

export async function getCertifiedTraineesByTrainer(trainerId) {
  await delay();
  const db = readDb();
  return db.users
    .filter((u) => u.role === "trainee" && u.assignedTrainerId === trainerId && u.status === "certified")
    .map(sanitizeUser);
}

export async function certifyTrainee(traineeId) {
  await delay();
  const db = readDb();
  const trainee = db.users.find((u) => u.id === traineeId);
  if (!trainee) throw new ApiError("Trainee not found.");
  trainee.status = "certified";
  db.notifications.push({
    id: uid("n"),
    userId: traineeId,
    message: "Congratulations! Your trainer has certified you as training complete.",
    read: false,
    createdAt: now(),
  });
  writeDb(db);
  return sanitizeUser(trainee);
}

/* ------------------------------- ADMIN --------------------------------- */

export async function getAllTrainees() {
  await delay();
  const db = readDb();
  return db.users.filter((u) => u.role === "trainee").map(sanitizeUser);
}

export async function getAllTrainers() {
  await delay();
  const db = readDb();
  return db.users.filter((u) => u.role === "trainer").map(sanitizeUser);
}

export async function getTrainerWithTrainees(trainerId) {
  await delay();
  const db = readDb();
  const trainer = db.users.find((u) => u.id === trainerId && u.role === "trainer");
  if (!trainer) throw new ApiError("Trainer not found.");
  const trainees = db.users.filter((u) => u.role === "trainee" && u.assignedTrainerId === trainerId);
  return { ...sanitizeUser(trainer), trainees: trainees.map(sanitizeUser) };
}

export async function assignTraineeToTrainer(traineeId, trainerId) {
  await delay();
  const db = readDb();
  const trainee = db.users.find((u) => u.id === traineeId);
  const trainer = db.users.find((u) => u.id === trainerId);
  if (!trainee || !trainer) throw new ApiError("Trainee or trainer not found.");
  trainee.assignedTrainerId = trainerId;
  trainee.status = "in_training";
  trainee.rejectionReason = null;
  db.notifications.push({
    id: uid("n"),
    userId: trainerId,
    message: `A new trainee, ${trainee.name}, has been assigned to you.`,
    read: false,
    createdAt: now(),
  });
  db.notifications.push({
    id: uid("n"),
    userId: traineeId,
    message: `You've been assigned to trainer ${trainer.name}. Training is now in progress.`,
    read: false,
    createdAt: now(),
  });
  writeDb(db);
  return sanitizeUser(trainee);
}

export async function rejectTrainee(traineeId, reason) {
  await delay();
  const db = readDb();
  const trainee = db.users.find((u) => u.id === traineeId);
  if (!trainee) throw new ApiError("Trainee not found.");
  trainee.status = "rejected";
  trainee.rejectionReason = reason;
  db.notifications.push({
    id: uid("n"),
    userId: traineeId,
    message: `Your registration was reviewed: ${reason}`,
    read: false,
    createdAt: now(),
  });
  writeDb(db);
  return sanitizeUser(trainee);
}

export async function getJobs() {
  await delay();
  const db = readDb();
  return db.jobs;
}

export async function addJob(job) {
  await delay();
  const db = readDb();
  const newJob = { id: uid("j"), postedAt: now(), ...job };
  db.jobs.push(newJob);
  writeDb(db);
  return newJob;
}

export async function updateJob(jobId, patch) {
  await delay();
  const db = readDb();
  const job = db.jobs.find((j) => j.id === jobId);
  if (!job) throw new ApiError("Job not found.");
  Object.assign(job, patch);
  writeDb(db);
  return job;
}

export async function deleteJob(jobId) {
  await delay();
  const db = readDb();
  db.jobs = db.jobs.filter((j) => j.id !== jobId);
  db.recommendations = db.recommendations.filter((r) => r.jobId !== jobId);
  writeDb(db);
  return { deleted: true };
}

export async function recommendJobToTrainee(traineeId, jobId) {
  await delay();
  const db = readDb();
  const trainee = db.users.find((u) => u.id === traineeId);
  const job = db.jobs.find((j) => j.id === jobId);
  if (!trainee || !job) throw new ApiError("Trainee or job not found.");

  const already = db.recommendations.some((r) => r.traineeId === traineeId && r.jobId === jobId);
  if (already) throw new ApiError("This job has already been recommended to this trainee.");

  const rec = { id: uid("r"), traineeId, jobId, recommendedAt: now(), applied: false };
  db.recommendations.push(rec);
  db.notifications.push({
    id: uid("n"),
    userId: traineeId,
    message: `You've been recommended for ${job.title} at ${job.company}.`,
    read: false,
    createdAt: now(),
  });
  writeDb(db);
  return rec;
}

/* --------------------------- NOTIFICATIONS ------------------------------ */

export async function getNotifications(userId) {
  await delay(150);
  const db = readDb();
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function markNotificationRead(notificationId) {
  const db = readDb();
  const n = db.notifications.find((n) => n.id === notificationId);
  if (n) n.read = true;
  writeDb(db);
}

export { ApiError };
