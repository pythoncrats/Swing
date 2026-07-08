-- ============================================================
-- Swing — Common/reference SQL queries
-- These are NOT run automatically by the app; the app uses
-- parameterized versions of these internally. This file is a
-- handy reference for you to run manually (MySQL Workbench,
-- CLI, TablePlus, etc.) while testing or inspecting data.
-- ============================================================

USE swing;

-- ---------- Users ----------

-- All pending trainee registrations
SELECT id, name, email, phone, location, created_at
FROM users
WHERE role = 'trainee' AND registration_status = 'pending';

-- All trainees assigned to trainers, with trainer name
SELECT u.id, u.name AS trainee_name, u.email, t.name AS trainer_name
FROM users u
JOIN users t ON u.assigned_trainer_id = t.id
WHERE u.role = 'trainee' AND u.registration_status = 'assigned';

-- All rejected trainees with reasons
SELECT id, name, email, rejection_reason
FROM users
WHERE role = 'trainee' AND registration_status = 'rejected';

-- All certified trainees
SELECT id, name, email, training_status
FROM users
WHERE role = 'trainee' AND training_status = 'certified';

-- All trainers with their bio/skills/education
SELECT id, name, email, phone, bio, trainer_skills, education_status
FROM users
WHERE role = 'trainer';

-- A trainer's assigned trainees
SELECT id, name, email, training_status
FROM users
WHERE role = 'trainee' AND assigned_trainer_id = ?;  -- pass trainer id

-- ---------- Trainee skills ----------

-- Skills (with documents) for one trainee
SELECT id, name, document_url
FROM trainee_skills
WHERE user_id = ?;

-- ---------- Jobs ----------

-- All active jobs
SELECT id, title, company, location, created_at
FROM jobs
WHERE is_active = TRUE
ORDER BY created_at DESC;

-- Jobs recommended to a specific trainee
SELECT j.*
FROM jobs j
JOIN recommended_jobs rj ON j.id = rj.job_id
WHERE rj.trainee_id = ?;

-- Jobs a trainee has applied to
SELECT j.*, aj.applied_at
FROM jobs j
JOIN applied_jobs aj ON j.id = aj.job_id
WHERE aj.trainee_id = ?;

-- ---------- Notifications ----------

-- Unread notifications for a user
SELECT id, message, type, created_at
FROM notifications
WHERE user_id = ? AND is_read = FALSE
ORDER BY created_at DESC;

-- Mark a notification as read
UPDATE notifications SET is_read = TRUE WHERE id = ?;

-- ---------- Useful admin dashboard counts ----------

SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'trainee' AND registration_status = 'pending')  AS pending_trainees,
  (SELECT COUNT(*) FROM users WHERE role = 'trainee' AND registration_status = 'assigned') AS assigned_trainees,
  (SELECT COUNT(*) FROM users WHERE role = 'trainee' AND registration_status = 'rejected') AS rejected_trainees,
  (SELECT COUNT(*) FROM users WHERE role = 'trainee' AND training_status = 'certified')    AS certified_trainees,
  (SELECT COUNT(*) FROM users WHERE role = 'trainer')                                      AS total_trainers,
  (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE)                                       AS active_jobs;
