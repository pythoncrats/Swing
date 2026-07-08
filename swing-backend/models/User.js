const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Columns that should NEVER be sent back in an API response
const SENSITIVE_FIELDS = ['password', 'otp_code', 'otp_expires', 'otp_attempts', 'otp_lock_until'];

const toSafeUser = (row) => {
  if (!row) return null;
  const safe = { ...row };
  SENSITIVE_FIELDS.forEach((f) => delete safe[f]);
  return safe;
};

// Create a new user (trainee, trainer, or admin). Password is hashed here.
const createUser = async ({
  role,
  name,
  email,
  password,
  phone = '',
  location = '',
  otpCode = null,
  otpExpires = null,
  isVerified = false
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO users
      (role, name, email, password, phone, location, otp_code, otp_expires, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [role, name, email.toLowerCase(), hashedPassword, phone, location, otpCode, otpExpires, isVerified]
  );

  return findUserById(result.insertId);
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [
    email.toLowerCase()
  ]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const findUsersByRole = async (role, extraWhere = '', params = []) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE role = ? ${extraWhere} ORDER BY created_at DESC`,
    [role, ...params]
  );
  return rows;
};

// Generic dynamic update: pass an object of { column_name: value }
const updateUserFields = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findUserById(id);

  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);

  await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
  return findUserById(id);
};

const matchPassword = async (enteredPassword, hashedPassword) => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

// ---- Trainee skills (separate table) ----

const replaceTraineeSkills = async (userId, skills) => {
  // skills = [{ name, documentUrl }]
  await pool.query('DELETE FROM trainee_skills WHERE user_id = ?', [userId]);
  if (!skills || skills.length === 0) return [];

  const values = skills.map((s) => [userId, s.name, s.documentUrl || null]);
  await pool.query('INSERT INTO trainee_skills (user_id, name, document_url) VALUES ?', [values]);

  return getTraineeSkills(userId);
};

const getTraineeSkills = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, name, document_url FROM trainee_skills WHERE user_id = ?',
    [userId]
  );
  return rows;
};

module.exports = {
  toSafeUser,
  createUser,
  findUserByEmail,
  findUserById,
  findUsersByRole,
  updateUserFields,
  matchPassword,
  replaceTraineeSkills,
  getTraineeSkills
};
