const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  getPendingTrainees,
  getAssignedTrainees,
  getRejectedTrainees,
  getCertifiedTrainees,
  getInTrainingTrainees,
  getTraineeById,
  assignTrainerToTrainee,
  rejectTrainee,
  getAllTrainers,
  getTrainerById,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  recommendJob
} = require('../controllers/adminController');

// Every route here requires a logged-in user with role === 'admin'
router.use(protect, authorize('admin'));

// Trainee review pipeline
router.get('/trainees/pending', getPendingTrainees);
router.get('/trainees/assigned', getAssignedTrainees);
router.get('/trainees/rejected', getRejectedTrainees);
router.get('/trainees/certified', getCertifiedTrainees);
router.get('/trainees/in-training', getInTrainingTrainees);
router.get('/trainees/:id', getTraineeById);
router.put('/trainees/:id/assign', assignTrainerToTrainee);
router.put('/trainees/:id/reject', rejectTrainee);
router.put('/trainees/:id/recommend-job', recommendJob);

// Trainer management
router.get('/trainers', getAllTrainers);
router.get('/trainers/:id', getTrainerById);

// Job management
router.get('/jobs', getAllJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

module.exports = router;
