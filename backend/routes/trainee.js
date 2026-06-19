import express from 'express';
import { body, validationResult } from 'express-validator';
import Trainee from '../models/Trainee.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Fixed path file name

const router = express.Router();

router.use(authMiddleware);

// Get trainee by ID
router.get('/:id', async (req, res, next) => {
  try {
    const trainee = await Trainee.findById(req.params.id)
      .populate('assignedTrainer')
      .populate('jobRecommendations');

    if (!trainee) {
      return res.status(404).json({ message: 'Trainee not found' });
    }

    res.status(200).json(trainee);
  } catch (error) {
    next(error);
  }
});

// Update trainee profile
router.put(
  '/:id/profile',
  [
    body('name').optional().notEmpty(),
    body('phone').optional().notEmpty(),
    body('existingSkills').optional(),
    body('skillsOfInterest').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone, existingSkills, skillsOfInterest } = req.body;

      const trainee = await Trainee.findByIdAndUpdate(
        req.params.id,
        {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(existingSkills && { existingSkills }),
          ...(skillsOfInterest && { skillsOfInterest })
        },
        { new: true }
      );

      if (!trainee) {
        return res.status(404).json({ message: 'Trainee not found' });
      }

      res.status(200).json({ message: 'Profile updated successfully', trainee });
    } catch (error) {
      next(error);
    }
  }
);

// Get job recommendations for trainee
router.get('/:id/jobs', async (req, res, next) => {
  try {
    const trainee = await Trainee.findById(req.params.id).populate('jobRecommendations');

    if (!trainee) {
      return res.status(404).json({ message: 'Trainee not found' });
    }

    res.status(200).json({ jobs: trainee.jobRecommendations });
  } catch (error) {
    next(error);
  }
});

export default router;