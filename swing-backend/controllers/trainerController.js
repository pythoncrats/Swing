const User = require('../models/User');
const Notification = require('../models/Notification');

// @route GET /api/trainer/profile
exports.getProfile = async (req, res) => {
  res.json({ profile: req.user.toSafeObject() });
};

// @route PUT /api/trainer/profile
// @desc  Trainer talks about themselves + lists their skills.
//        Visible to admin and reflected on the trainer's own profile.
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, trainerSkills, educationStatus } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (educationStatus !== undefined) user.educationStatus = educationStatus;
    if (trainerSkills !== undefined) {
      user.trainerSkills =
        typeof trainerSkills === 'string' ? JSON.parse(trainerSkills) : trainerSkills;
    }

    await user.save();
    res.json({ message: 'Profile updated', profile: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// @route GET /api/trainer/trainees
// @desc  List of trainees assigned to this trainer by the admin
exports.getAssignedTrainees = async (req, res) => {
  try {
    const trainees = await User.find({
      role: 'trainee',
      assignedTrainer: req.user._id
    }).select('-password');
    res.json({ trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainees', error: err.message });
  }
};

// @route GET /api/trainer/trainees/certified
// @desc  List of certified trainees who finished training under this trainer
exports.getCertifiedTrainees = async (req, res) => {
  try {
    const trainees = await User.find({
      role: 'trainee',
      assignedTrainer: req.user._id,
      trainingStatus: 'certified'
    }).select('-password');
    res.json({ trainees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch certified trainees', error: err.message });
  }
};

// @route PUT /api/trainer/trainees/:id/progress
// @desc  Mark a trainee's training as in_progress
exports.markInProgress = async (req, res) => {
  try {
    const trainee = await User.findOne({
      _id: req.params.id,
      role: 'trainee',
      assignedTrainer: req.user._id
    });

    if (!trainee) return res.status(404).json({ message: 'Trainee not found under your supervision' });

    trainee.trainingStatus = 'in_progress';
    await trainee.save();

    res.json({ message: 'Trainee marked as in progress', trainee: trainee.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update trainee', error: err.message });
  }
};

// @route PUT /api/trainer/trainees/:id/certify
// @desc  Only the trainer can certify a trainee (verifies completion of training)
exports.certifyTrainee = async (req, res) => {
  try {
    const trainee = await User.findOne({
      _id: req.params.id,
      role: 'trainee',
      assignedTrainer: req.user._id
    });

    if (!trainee) return res.status(404).json({ message: 'Trainee not found under your supervision' });

    trainee.trainingStatus = 'certified';
    await trainee.save();

    await Notification.create({
      user: trainee._id,
      type: 'certified',
      message: `Congratulations! You have been certified by your trainer ${req.user.name}.`
    });

    res.json({ message: 'Trainee certified', trainee: trainee.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to certify trainee', error: err.message });
  }
};

// @route GET /api/trainer/notifications
// @desc  Trainer receives notifications when a new trainee is assigned by admin
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};
