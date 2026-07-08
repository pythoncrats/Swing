const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  updateSkills,
  getStatus,
  getRecommendedJobs,
  applyToJob,
  getNotifications
} = require('../controllers/traineeController');

// Every route here requires a logged-in, verified user with role === 'trainee'
router.use(protect, authorize('trainee'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/skills', upload.array('documents', 10), updateSkills);
router.get('/status', getStatus);
router.get('/jobs', getRecommendedJobs);
router.post('/jobs/:jobId/apply', applyToJob);
router.get('/notifications', getNotifications);

module.exports = router;
