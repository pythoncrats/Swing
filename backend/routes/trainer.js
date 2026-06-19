import express from 'express';
import Trainer from '../models/Trainer.js';
import Trainee from '../models/Trainee.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Fixed path file name

const router = express.Router();

router.use(authMiddleware);

// Get trainer by ID
router.get('/:id', async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('assignedTrainees')
      .populate('certifiedTrainees')
      .populate('failedTrainees');

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    res.status(200).json(trainer);
  } catch (error) {
    next(error);
  }
});

// Get all trainees assigned to a trainer
router.get('/:id/trainees', async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate('assignedTrainees');

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    res.status(200).json({ trainees: trainer.assignedTrainees });
  } catch (error) {
    next(error);
  }
});

// Certify a trainee
router.post('/:trainerId/certify/:traineeId', async (req, res, next) => {
  try {
    const trainee = await Trainee.findByIdAndUpdate(
      req.params.traineeId,
      {
        trainingStatus: 'certified',
        certificationDate: new Date()
      },
      { new: true }
    );

    const trainer = await Trainer.findById(req.params.trainerId);
    if (trainer && !trainer.certifiedTrainees.includes(req.params.traineeId)) {
      trainer.certifiedTrainees.push(req.params.traineeId);
      await trainer.save();
    }

    res.status(200).json({ message: 'Trainee certified successfully', trainee });
  } catch (error) {
    next(error);
  }
});

// Fail a trainee
router.post('/:trainerId/fail/:traineeId', async (req, res, next) => {
  try {
    const trainee = await Trainee.findByIdAndUpdate(
      req.params.traineeId,
      { trainingStatus: 'failed' },
      { new: true }
    );

    const trainer = await Trainer.findById(req.params.trainerId);
    if (trainer && !trainer.failedTrainees.includes(req.params.traineeId)) {
      trainer.failedTrainees.push(req.params.traineeId);
      await trainer.save();
    }

    res.status(200).json({ message: 'Trainee marked as failed', trainee });
  } catch (error) {
    next(error);
  }
});

export default router;