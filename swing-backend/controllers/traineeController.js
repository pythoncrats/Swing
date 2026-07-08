const {
  findUserById,
  updateUserFields,
  toSafeUser,
  replaceTraineeSkills,
  getTraineeSkills
} = require('../models/User');
const {
  findJobById,
  getRecommendedJobsForTrainee,
  isJobRecommendedToTrainee,
  hasAppliedToJob,
  applyToJob: applyToJobModel
} = require('../models/Job');
const { getNotificationsForUser } = require('../models/Notification');

const withSkills = async (user) => {
  const safe = toSafeUser(user);
  safe.skills = await getTraineeSkills(user.id);
  return safe;
};

// @route GET /api/trainee/profile
exports.getProfile = async (req, res) => {
  const profile = await withSkills(req.user);
  res.json({ profile });
};

// @route PUT /api/trainee/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const fields = {};
    if (name) fields.name = name;
    if (phone !== undefined) fields.phone = phone;
    if (location !== undefined) fields.location = location;

    const updated = await updateUserFields(req.user.id, fields);
    res.json({ message: 'Profile updated', profile: await withSkills(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// @route PUT /api/trainee/skills
// @desc  Set hasSkills = true/false.
//        If true: submit skills[] (with optional uploaded documents).
//        If false: submit skillsOfInterest[].
exports.updateSkills = async (req, res) => {
  try {
    const { hasSkills } = req.body;
    if (hasSkills === undefined) {
      return res.status(400).json({ message: 'hasSkills (true/false) is required' });
    }

    const hasSkillsBool = hasSkills === true || hasSkills === 'true';

    if (hasSkillsBool) {
      let skillNames = [];
      if (req.body.skills) {
        skillNames = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
      }

      const uploadedFiles = req.files || [];
      const skillsPayload = skillNames.map((name, idx) => ({
        name,
        documentUrl: uploadedFiles[idx] ? `/uploads/skills/${uploadedFiles[idx].filename}` : null
      }));

      await replaceTraineeSkills(req.user.id, skillsPayload);
      await updateUserFields(req.user.id, { has_skills: true, skills_of_interest: null });
    } else {
      let interests = [];
      if (req.body.skillsOfInterest) {
        interests =
          typeof req.body.skillsOfInterest === 'string'
            ? JSON.parse(req.body.skillsOfInterest)
            : req.body.skillsOfInterest;
      }

      await replaceTraineeSkills(req.user.id, []); // clear any previous skill rows
      await updateUserFields(req.user.id, {
        has_skills: false,
        skills_of_interest: JSON.stringify(interests)
      });
    }

    const updated = await findUserById(req.user.id);
    res.json({ message: 'Skills updated', profile: await withSkills(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update skills', error: err.message });
  }
};

// @route GET /api/trainee/status
exports.getStatus = async (req, res) => {
  res.json({
    registrationStatus: req.user.registration_status,
    trainingStatus: req.user.training_status,
    rejectionReason: req.user.rejection_reason || null,
    assignedTrainerId: req.user.assigned_trainer_id
  });
};

// @route GET /api/trainee/jobs
exports.getRecommendedJobs = async (req, res) => {
  try {
    const jobs = await getRecommendedJobsForTrainee(req.user.id);
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

// @route POST /api/trainee/jobs/:jobId/apply
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (req.user.training_status !== 'certified') {
      return res.status(403).json({ message: 'Only certified trainees may apply to jobs' });
    }

    const recommended = await isJobRecommendedToTrainee(req.user.id, jobId);
    if (!recommended) {
      return res.status(403).json({ message: 'You can only apply to jobs recommended to you' });
    }

    const alreadyApplied = await hasAppliedToJob(req.user.id, jobId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You already applied to this job' });
    }

    const job = await findJobById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    await applyToJobModel(req.user.id, jobId);
    res.json({ message: `Applied to ${job.title} at ${job.company}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to apply to job', error: err.message });
  }
};

// @route GET /api/trainee/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsForUser(req.user.id);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};
