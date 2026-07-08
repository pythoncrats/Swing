const { pool } = require('../config/db');

const createJob = async ({ title, company, description, requirements = [], location = '', postedBy }) => {
  const [result] = await pool.query(
    `INSERT INTO jobs (title, company, description, requirements, location, posted_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, company, description, JSON.stringify(requirements), location, postedBy]
  );
  return findJobById(result.insertId);
};

const findJobById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const getAllJobs = async () => {
  const [rows] = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
  return rows;
};

const updateJob = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findJobById(id);

  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => (k === 'requirements' ? JSON.stringify(fields[k]) : fields[k]));

  await pool.query(`UPDATE jobs SET ${setClause} WHERE id = ?`, [...values, id]);
  return findJobById(id);
};

const deleteJob = async (id) => {
  const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// ---- Recommended jobs (junction table) ----

const recommendJobToTrainee = async (traineeId, jobId) => {
  await pool.query('INSERT INTO recommended_jobs (trainee_id, job_id) VALUES (?, ?)', [
    traineeId,
    jobId
  ]);
};

const isJobRecommendedToTrainee = async (traineeId, jobId) => {
  const [rows] = await pool.query(
    'SELECT id FROM recommended_jobs WHERE trainee_id = ? AND job_id = ? LIMIT 1',
    [traineeId, jobId]
  );
  return rows.length > 0;
};

const getRecommendedJobsForTrainee = async (traineeId) => {
  const [rows] = await pool.query(
    `SELECT j.* FROM jobs j
     JOIN recommended_jobs rj ON j.id = rj.job_id
     WHERE rj.trainee_id = ?
     ORDER BY rj.recommended_at DESC`,
    [traineeId]
  );
  return rows;
};

// ---- Applied jobs (junction table) ----

const applyToJob = async (traineeId, jobId) => {
  await pool.query('INSERT INTO applied_jobs (trainee_id, job_id) VALUES (?, ?)', [
    traineeId,
    jobId
  ]);
};

const hasAppliedToJob = async (traineeId, jobId) => {
  const [rows] = await pool.query(
    'SELECT id FROM applied_jobs WHERE trainee_id = ? AND job_id = ? LIMIT 1',
    [traineeId, jobId]
  );
  return rows.length > 0;
};

module.exports = {
  createJob,
  findJobById,
  getAllJobs,
  updateJob,
  deleteJob,
  recommendJobToTrainee,
  isJobRecommendedToTrainee,
  getRecommendedJobsForTrainee,
  applyToJob,
  hasAppliedToJob
};
