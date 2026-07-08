-- ============================================================
-- Swing — MySQL Schema
-- Run this file to create the database and all tables.
--   mysql -u root -p < sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS swing
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE swing;

-- ------------------------------------------------------------
-- users
-- One table for all three roles (trainee, trainer, admin).
-- Trainee-only and trainer-only columns are simply left NULL
-- for the roles that don't use them.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  role                  ENUM('trainee', 'trainer', 'admin') NOT NULL,

  -- Shared basic profile
  name                  VARCHAR(150) NOT NULL,
  email                 VARCHAR(150) NOT NULL UNIQUE,
  password              VARCHAR(255) NOT NULL,
  phone                 VARCHAR(30)  DEFAULT '',
  location              VARCHAR(150) DEFAULT '',

  -- Email / OTP verification
  is_verified           BOOLEAN      DEFAULT FALSE,
  otp_code              VARCHAR(10)  DEFAULT NULL,
  otp_expires           DATETIME     DEFAULT NULL,
  otp_attempts          INT          DEFAULT 0,
  otp_lock_until        DATETIME     DEFAULT NULL,

  -- ===== Trainee-only fields =====
  has_skills            BOOLEAN      DEFAULT NULL,        -- NULL = not answered yet
  skills_of_interest    JSON         DEFAULT NULL,         -- used when has_skills = FALSE
  training_status       ENUM('not_started', 'in_progress', 'certified') DEFAULT 'not_started',
  registration_status   ENUM('pending', 'assigned', 'rejected') DEFAULT 'pending',
  rejection_reason      TEXT         DEFAULT '',
  assigned_trainer_id   INT          DEFAULT NULL,

  -- ===== Trainer-only fields =====
  bio                   TEXT         DEFAULT '',
  trainer_skills        JSON         DEFAULT NULL,
  education_status      VARCHAR(255) DEFAULT '',

  created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_assigned_trainer
    FOREIGN KEY (assigned_trainer_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_role (role),
  INDEX idx_registration_status (registration_status),
  INDEX idx_training_status (training_status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- trainee_skills
-- Used when a trainee answers "Yes" to having skills.
-- Each row = one skill (+ optional uploaded proof document).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trainee_skills (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  name           VARCHAR(150) NOT NULL,
  document_url   VARCHAR(255) DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- jobs
-- Job/company openings managed by admins.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(200) NOT NULL,
  company        VARCHAR(200) NOT NULL,
  description    TEXT NOT NULL,
  requirements   JSON DEFAULT NULL,
  location       VARCHAR(150) DEFAULT '',
  is_active      BOOLEAN DEFAULT TRUE,
  posted_by      INT NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- recommended_jobs
-- Junction table: which jobs an admin has recommended to which
-- certified trainees.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommended_jobs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  trainee_id    INT NOT NULL,
  job_id        INT NOT NULL,
  recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_recommendation (trainee_id, job_id),
  FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- applied_jobs
-- Junction table: which trainees applied to which recommended jobs.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applied_jobs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  trainee_id    INT NOT NULL,
  job_id        INT NOT NULL,
  applied_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_application (trainee_id, job_id),
  FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  message       TEXT NOT NULL,
  type          ENUM('trainee_assigned', 'job_recommended', 'certified', 'rejected', 'general') DEFAULT 'general',
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;
