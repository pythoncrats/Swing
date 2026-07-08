const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// ===================== TRAINEE REVIEW PIPELINE =====================

// @route GET /api/admin/trainees/pending
// @desc  Trainees who registered and are waiting for confirmation/assignment
exports.getPendingTrainees = async (req, res) => {
  try {
    const trainees = await User.find({ role: 'trainee', registrationStatus: 'pending' }).select(
      '-password'
    );
    res.json({ trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/assigned
// @desc  Trainees who have been assigned to trainers
exports.getAssignedTrainees = async (req, res) => {
  try {
    const trainees = await User.find({ role: 'trainee', registrationStatus: 'assigned' })
      .populate('assignedTrainer', 'name email')
      .select('-password');
    res.json({ trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assigned trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/rejected
// @desc  Trainees who were rejected, with the admin's comment/reason
exports.getRejectedTrainees = async (req, res) => {
  try {
    const trainees = await User.find({ role: 'trainee', registrationStatus: 'rejected' }).select(
      '-password'
    );
    res.json({ trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rejected trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/certified
exports.getCertifiedTrainees = async (req, res) => {
  try {
    const trainees = await User.find({ role: 'trainee', trainingStatus: 'certified' })
      .populate('assignedTrainer', 'name email')
      .select('-password');
    res.json({ trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch certified trainees', error: err.message });
  }
};

// @route GET /api/admin/trainees/in-training
// @desc  Trainees still in training (assigned + not yet certified)
exports.getInTrainingTrainees = async (req, res) => {
  try {
    const trainees = await User.find({
      role: 'trainee',
      registrationStatus: 'assigned',
      trainingStatus: { $in: ['not_started', 'in_progress'] }
    })
      .populate('assignedTrainer', 'name email')
      .select('-password');
    res.json({ trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainees in training', error: err.message });
  }
};

// @route GET /api/admin/trainees/:id
// @desc  View a single trainee's full profile (skills, docs, status, etc.)
exports.getTraineeById = async (req, res) => {
  try {
    const trainee = await User.findOne({ _id: req.params.id, role: 'trainee' })
      .populate('assignedTrainer', 'name email')
      .populate('recommendedJobs')
      .select('-password');
    if (!trainee) return res.status(404).json({ message: 'Trainee not found' });
    res.json({ trainee });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainee', error: err.message });
  }
};

// @route PUT /api/admin/trainees/:id/assign
// @desc  Assign a pending trainee to a trainer. Trainer gets a notification.
exports.assignTrainerToTrainee = async (req, res) => {
  try {
    const { trainerId } = req.body;
    if (!trainerId) return res.status(400).json({ message: 'trainerId is required' });

    const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    const trainee = await User.findOne({ _id: req.params.id, role: 'trainee' });
    if (!trainee) return res.status(404).json({ message: 'Trainee not found' });

    trainee.assignedTrainer = trainer._id;
    trainee.registrationStatus = 'assigned';
    trainee.trainingStatus = 'in_progress';
    trainee.rejectionReason = '';
    await trainee.save();

    await Notification.create({
      user: trainer._id,
      type: 'trainee_assigned',
      message: `A new trainee, ${trainee.name}, has been assigned to you.`
    });

    res.json({ message: 'Trainee assigned to trainer', trainee: trainee.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign trainee', error: err.message });
  }
};

// @route PUT /api/admin/trainees/:id/reject
// @desc  Reject a trainee's registration with a comment, visible to the trainee
exports.rejectTrainee = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'A rejection reason/comment is required' });

    const trainee = await User.findOne({ _id: req.params.id, role: 'trainee' });
    if (!trainee) return res.status(404).json({ message: 'Trainee not found' });

    trainee.registrationStatus = 'rejected';
    trainee.rejectionReason = reason;
    trainee.assignedTrainer = null;
    await trainee.save();

    await Notification.create({
      user: trainee._id,
      type: 'rejected',
      message: `Your registration was rejected. Reason: ${reason}`
    });

    res.json({ message: 'Trainee rejected', trainee: trainee.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject trainee', error: err.message });
  }
};

// ===================== TRAINER MANAGEMENT =====================

// @route GET /api/admin/trainers
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('-password');
    res.json({ trainers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainers', error: err.message });
  }
};

// @route GET /api/admin/trainers/:id
// @desc  View a trainer's full profile: email, contacts, education, skills,
//        and the list of trainees they're handling.
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' }).select('-password');
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    const trainees = await User.find({ role: 'trainee', assignedTrainer: trainer._id }).select(
      '-password'
    );

    res.json({ trainer, trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainer', error: err.message });
  }
};

// ===================== JOB MANAGEMENT =====================

// @route GET /api/admin/jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

// @route POST /api/admin/jobs
// @desc  Admin adds a job/company opening after researching availability
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, location } = req.body;
    if (!title || !company || !description) {
      return res.status(400).json({ message: 'title, company, and description are required' });
    }

    const job = await Job.create({
      title,
      company,
      description,
      requirements: requirements || [],
      location,
      postedBy: req.user._id
    });

    res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
};

// @route PUT /api/admin/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const { title, company, description, requirements, location, isActive } = req.body;
    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (location !== undefined) job.location = location;
    if (isActive !== undefined) job.isActive = isActive;

    await job.save();
    res.json({ message: 'Job updated', job });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job', error: err.message });
  }
};

// @route DELETE /api/admin/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete job', error: err.message });
  }
};

// @route PUT /api/admin/trainees/:id/recommend-job
// @desc  Admin views a certified trainee's profile and recommends an
//        available job. Trainee receives a notification and can then apply.
exports.recommendJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const trainee = await User.findOne({ _id: req.params.id, role: 'trainee' });
    if (!trainee) return res.status(404).json({ message: 'Trainee not found' });

    if (trainee.trainingStatus !== 'certified') {
      return res.status(403).json({ message: 'Only certified trainees can be recommended jobs' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (trainee.recommendedJobs.some((id) => id.toString() === jobId)) {
      return res.status(400).json({ message: 'This job was already recommended to this trainee' });
    }

    trainee.recommendedJobs.push(jobId);
    await trainee.save();

    await Notification.create({
      user: trainee._id,
      type: 'job_recommended',
      message: `A new job has been recommended to you: ${job.title} at ${job.company}.`
    });

    res.json({ message: 'Job recommended to trainee', trainee: trainee.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to recommend job', error: err.message });
  }
};
