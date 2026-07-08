const { pool } = require('../config/db');
const { findUserById, updateUserFields, toSafeUser, getTraineeSkills } = require('../models/User');
const {
  createJob,
  findJobById,
  getAllJobs,
  updateJob,
  deleteJob,
  recommendJobToTrainee,
  isJobRecommendedToTrainee
} = require('../models/Job');
const { createNotification } = require('../models/Notification');

const TRAINEE_LIST_COLUMNS =
  'id, name, email, phone, location, training_status, registration_status, rejection_reason, assigned_trainer_id, created_at';

// ===================== TRAINEE REVIEW PIPELINE =====================

// @route GET /api/admin/trainees/pending
exports.getPendingTrainees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${TRAINEE_LIST_COLUMNS} FROM users
       WHERE role = 'trainee' AND registration_status = 'pending'
       ORDER BY created_at DESC`
    );
    res.json({ trainees: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/assigned
exports.getAssignedTrainees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.location, u.training_status, u.registration_status,
              t.id AS trainer_id, t.name AS trainer_name, t.email AS trainer_email
       FROM users u
       LEFT JOIN users t ON u.assigned_trainer_id = t.id
       WHERE u.role = 'trainee' AND u.registration_status = 'assigned'
       ORDER BY u.created_at DESC`
    );
    res.json({ trainees: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assigned trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/rejected
exports.getRejectedTrainees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${TRAINEE_LIST_COLUMNS} FROM users
       WHERE role = 'trainee' AND registration_status = 'rejected'
       ORDER BY created_at DESC`
    );
    res.json({ trainees: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rejected trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/certified
exports.getCertifiedTrainees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.location, u.training_status,
              t.id AS trainer_id, t.name AS trainer_name
       FROM users u
       LEFT JOIN users t ON u.assigned_trainer_id = t.id
       WHERE u.role = 'trainee' AND u.training_status = 'certified'
       ORDER BY u.created_at DESC`
    );
    res.json({ trainees: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch certified trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/in-training
exports.getInTrainingTrainees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.location, u.training_status,
              t.id AS trainer_id, t.name AS trainer_name
       FROM users u
       LEFT JOIN users t ON u.assigned_trainer_id = t.id
       WHERE u.role = 'trainee' AND u.registration_status = 'assigned'
         AND u.training_status IN ('not_started', 'in_progress')
       ORDER BY u.created_at DESC`
    );
    res.json({ trainees: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainees in training', error: err.message });
  }
};

// @route GET /api/admin/trainees/:id
exports.getTraineeById = async (req, res) => {
  try {
    const trainee = await findUserById(req.params.id);
    if (!trainee || trainee.role !== 'trainee') {
      return res.status(404).json({ message: 'Trainee not found' });
    }

    const skills = await getTraineeSkills(trainee.id);

    const [jobRows] = await pool.query(
      `SELECT j.* FROM jobs j
       JOIN recommended_jobs rj ON j.id = rj.job_id
       WHERE rj.trainee_id = ?`,
      [trainee.id]
    );

    res.json({ trainee: { ...toSafeUser(trainee), skills, recommendedJobs: jobRows } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainee', error: err.message });
  }
};

// @route PUT /api/admin/trainees/:id/assign
exports.assignTrainerToTrainee = async (req, res) => {
  try {
    const { trainerId } = req.body;
    if (!trainerId) return res.status(400).json({ message: 'trainerId is required' });

    const trainer = await findUserById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const trainee = await findUserById(req.params.id);
    if (!trainee || trainee.role !== 'trainee') {
      return res.status(404).json({ message: 'Trainee not found' });
    }

    const updated = await updateUserFields(trainee.id, {
      assigned_trainer_id: trainer.id,
      registration_status: 'assigned',
      training_status: 'in_progress',
      rejection_reason: ''
    });

    await createNotification({
      userId: trainer.id,
      type: 'trainee_assigned',
      message: `A new trainee, ${trainee.name}, has been assigned to you.`
    });

    res.json({ message: 'Trainee assigned to trainer', trainee: toSafeUser(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign trainee', error: err.message });
  }
};

// @route PUT /api/admin/trainees/:id/reject
exports.rejectTrainee = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'A rejection reason/comment is required' });

    const trainee = await findUserById(req.params.id);
    if (!trainee || trainee.role !== 'trainee') {
      return res.status(404).json({ message: 'Trainee not found' });
    }

    const updated = await updateUserFields(trainee.id, {
      registration_status: 'rejected',
      rejection_reason: reason,
      assigned_trainer_id: null
    });

    await createNotification({
      userId: trainee.id,
      type: 'rejected',
      message: `Your registration was rejected. Reason: ${reason}`
    });

    res.json({ message: 'Trainee rejected', trainee: toSafeUser(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject trainee', error: err.message });
  }
};

// ===================== TRAINER MANAGEMENT =====================

// @route GET /api/admin/trainers
exports.getAllTrainers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, location, bio, trainer_skills, education_status, created_at
       FROM users WHERE role = 'trainer' ORDER BY created_at DESC`
    );
    res.json({ trainers: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainers', error: err.message });
  }
};

// @route GET /api/admin/trainers/:id
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await findUserById(req.params.id);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const [trainees] = await pool.query(
      `SELECT id, name, email, training_status FROM users
       WHERE role = 'trainee' AND assigned_trainer_id = ?`,
      [trainer.id]
    );

    res.json({ trainer: toSafeUser(trainer), trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainer', error: err.message });
  }
};

// ===================== JOB MANAGEMENT =====================

// @route GET /api/admin/jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

// @route POST /api/admin/jobs
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, location } = req.body;
    if (!title || !company || !description) {
      return res.status(400).json({ message: 'title, company, and description are required' });
    }

    const job = await createJob({
      title,
      company,
      description,
      requirements: requirements || [],
      location,
      postedBy: req.user.id
    });

    res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
};

// @route PUT /api/admin/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const existing = await findJobById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Job not found' });

    const { title, company, description, requirements, location, isActive } = req.body;
    const fields = {};
    if (title !== undefined) fields.title = title;
    if (company !== undefined) fields.company = company;
    if (description !== undefined) fields.description = description;
    if (requirements !== undefined) fields.requirements = requirements;
    if (location !== undefined) fields.location = location;
    if (isActive !== undefined) fields.is_active = isActive;

    const job = await updateJob(req.params.id, fields);
    res.json({ message: 'Job updated', job });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job', error: err.message });
  }
};

// @route DELETE /api/admin/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const deleted = await deleteJob(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete job', error: err.message });
  }
};

// @route PUT /api/admin/trainees/:id/recommend-job
exports.recommendJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const trainee = await findUserById(req.params.id);
    if (!trainee || trainee.role !== 'trainee') {
      return res.status(404).json({ message: 'Trainee not found' });
    }

    if (trainee.training_status !== 'certified') {
      return res.status(403).json({ message: 'Only certified trainees can be recommended jobs' });
    }

    const job = await findJobById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyRecommended = await isJobRecommendedToTrainee(trainee.id, jobId);
    if (alreadyRecommended) {
      return res.status(400).json({ message: 'This job was already recommended to this trainee' });
    }

    await recommendJobToTrainee(trainee.id, jobId);

    await createNotification({
      userId: trainee.id,
      type: 'job_recommended',
      message: `A new job has been recommended to you: ${job.title} at ${job.company}.`
    });

    res.json({ message: 'Job recommended to trainee' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to recommend job', error: err.message });
  }
};
