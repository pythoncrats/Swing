const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  getProfile,
  updateProfile,
  getAssignedTrainees,
  getCertifiedTrainees,
  markInProgress,
  certifyTrainee,
  getNotifications
} = require('../controllers/trainerController');

// Every route here requires a logged-in, verified user with role === 'trainer'
router.use(protect, authorize('trainer'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/trainees', getAssignedTrainees);
router.get('/trainees/certified', getCertifiedTrainees);
router.put('/trainees/:id/progress', markInProgress);
router.put('/trainees/:id/certify', certifyTrainee);
router.get('/notifications', getNotifications);

module.exports = router;
