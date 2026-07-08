const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @route GET /api/trainee/profile
exports.getProfile = async (req, res) => {
  res.json({ profile: req.user.toSafeObject() });
};

// @route PUT /api/trainee/profile
// @desc  Update name/phone/location (basic profile info)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;

    await user.save();
    res.json({ message: 'Profile updated', profile: user.toSafeObject() });
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
    const user = await User.findById(req.user._id);
    const { hasSkills } = req.body;

    if (hasSkills === undefined) {
      return res.status(400).json({ message: 'hasSkills (true/false) is required' });
    }

    const hasSkillsBool = hasSkills === true || hasSkills === 'true';
    user.hasSkills = hasSkillsBool;

    if (hasSkillsBool) {
      // Expect skills as JSON string array of names: ["Plumbing","Welding"]
      let skillNames = [];
      if (req.body.skills) {
        skillNames = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
      }

      const uploadedFiles = req.files || [];
      user.skills = skillNames.map((name, idx) => ({
        name,
        documentUrl: uploadedFiles[idx] ? `/uploads/skills/${uploadedFiles[idx].filename}` : null
      }));
      user.skillsOfInterest = [];
    } else {
      let interests = [];
      if (req.body.skillsOfInterest) {
        interests =
          typeof req.body.skillsOfInterest === 'string'
            ? JSON.parse(req.body.skillsOfInterest)
            : req.body.skillsOfInterest;
      }
      user.skillsOfInterest = interests;
      user.skills = [];
    }

    await user.save();
    res.json({ message: 'Skills updated', profile: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update skills', error: err.message });
  }
};

// @route GET /api/trainee/status
// @desc  Shows training progress / certified status
exports.getStatus = async (req, res) => {
  res.json({
    registrationStatus: req.user.registrationStatus,
    trainingStatus: req.user.trainingStatus,
    rejectionReason: req.user.rejectionReason || null,
    assignedTrainer: req.user.assignedTrainer
  });
};

// @route GET /api/trainee/jobs
// @desc  List jobs recommended to this trainee by an admin.
//        Only visible once trainee is certified AND jobs have been recommended.
exports.getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recommendedJobs');
    res.json({ jobs: user.recommendedJobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

// @route POST /api/trainee/jobs/:jobId/apply
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.trainingStatus !== 'certified') {
      return res.status(403).json({ message: 'Only certified trainees may apply to jobs' });
    }

    if (!user.recommendedJobs.some((id) => id.toString() === jobId)) {
      return res.status(403).json({ message: 'You can only apply to jobs recommended to you' });
    }

    if (user.appliedJobs.some((id) => id.toString() === jobId)) {
      return res.status(400).json({ message: 'You already applied to this job' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    user.appliedJobs.push(jobId);
    await user.save();

    res.json({ message: `Applied to ${job.title} at ${job.company}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to apply to job', error: err.message });
  }
};

// @route GET /api/trainee/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};
