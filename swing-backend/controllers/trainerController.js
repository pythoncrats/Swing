const { pool } = require('../config/db');
const { findUserById, updateUserFields, toSafeUser } = require('../models/User');
const { createNotification, getNotificationsForUser } = require('../models/Notification');

// @route GET /api/trainer/profile
exports.getProfile = async (req, res) => {
  res.json({ profile: toSafeUser(req.user) });
};

// @route PUT /api/trainer/profile
// @desc  Trainer talks about themselves + lists their skills.
//        Visible to admin and reflected on the trainer's own profile.
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, trainerSkills, educationStatus } = req.body;
    const fields = {};
    if (name) fields.name = name;
    if (phone !== undefined) fields.phone = phone;
    if (location !== undefined) fields.location = location;
    if (bio !== undefined) fields.bio = bio;
    if (educationStatus !== undefined) fields.education_status = educationStatus;
    if (trainerSkills !== undefined) {
      const skillsArr = typeof trainerSkills === 'string' ? JSON.parse(trainerSkills) : trainerSkills;
      fields.trainer_skills = JSON.stringify(skillsArr);
    }

    const updated = await updateUserFields(req.user.id, fields);
    res.json({ message: 'Profile updated', profile: toSafeUser(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// @route GET /api/trainer/trainees
// @desc  List of trainees assigned to this trainer by the admin
exports.getAssignedTrainees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, location, training_status, registration_status, created_at
       FROM users WHERE role = 'trainee' AND assigned_trainer_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ trainees: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainees', error: err.message });
  }
};

// @route GET /api/trainer/trainees/certified
exports.getCertifiedTrainees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, location, training_status
       FROM users
       WHERE role = 'trainee' AND assigned_trainer_id = ? AND training_status = 'certified'
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ trainees: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch certified trainees', error: err.message });
  }
};

const findAssignedTrainee = async (trainerId, traineeId) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE id = ? AND role = 'trainee' AND assigned_trainer_id = ? LIMIT 1`,
    [traineeId, trainerId]
  );
  return rows[0] || null;
};

// @route PUT /api/trainer/trainees/:id/progress
exports.markInProgress = async (req, res) => {
  try {
    const trainee = await findAssignedTrainee(req.user.id, req.params.id);
    if (!trainee) return res.status(404).json({ message: 'Trainee not found under your supervision' });

    const updated = await updateUserFields(trainee.id, { training_status: 'in_progress' });
    res.json({ message: 'Trainee marked as in progress', trainee: toSafeUser(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update trainee', error: err.message });
  }
};

// @route PUT /api/trainer/trainees/:id/certify
// @desc  Only the trainer can certify a trainee (verifies completion of training)
exports.certifyTrainee = async (req, res) => {
  try {
    const trainee = await findAssignedTrainee(req.user.id, req.params.id);
    if (!trainee) return res.status(404).json({ message: 'Trainee not found under your supervision' });

    const updated = await updateUserFields(trainee.id, { training_status: 'certified' });

    await createNotification({
      userId: trainee.id,
      type: 'certified',
      message: `Congratulations! You have been certified by your trainer ${req.user.name}.`
    });

    res.json({ message: 'Trainee certified', trainee: toSafeUser(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to certify trainee', error: err.message });
  }
};

// @route GET /api/trainer/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsForUser(req.user.id);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};
