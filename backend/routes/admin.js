import express from 'express';
import { body, validationResult } from 'express-validator';
import Trainee from '../models/Trainee.js';
import Trainer from '../models/Trainer.js';
import Organization from '../models/Organization.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Fixed path file name
//import { sendNotificationEmail } from '../utils/email.js';

const router = express.Router();

router.use(authMiddleware);

// Get all trainees
router.get('/trainees', async (req, res, next) => {
  try {
    const trainees = await Trainee.find()
      .populate('assignedTrainer')
      .populate('jobRecommendations');

    res.status(200).json(trainees);
  } catch (error) {
    next(error);
  }
});

// Get all trainers
router.get('/trainers', async (req, res, next) => {
  try {
    const trainers = await Trainer.find();

    res.status(200).json(trainers);
  } catch (error) {
    next(error);
  }
});

// Assign trainee to trainer
router.post(
  '/assign-trainee',
  [
    body('traineeId').notEmpty(),
    body('trainerId').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { traineeId, trainerId } = req.body;

      const trainee = await Trainee.findByIdAndUpdate(
        traineeId,
        {
          assignedTrainer: trainerId,
          trainingStatus: 'assigned'
        },
        { new: true }
      ).populate('assignedTrainer');

      const trainer = await Trainer.findById(trainerId);
      if (trainer && !trainer.assignedTrainees.includes(traineeId)) {
        trainer.assignedTrainees.push(traineeId);
        await trainer.save();
      }

      await Notification.create({
        recipient: traineeId,
        recipientModel: 'Trainee',
        type: 'training-assigned',
        title: 'Training Assignment',
        message: `You have been assigned to trainer: ${trainer.name}`
      });

      res.status(200).json({ message: 'Trainee assigned successfully', trainee });
    } catch (error) {
      next(error);
    }
  }
);

// Recommend a job to a trainee
router.post(
  '/recommend-job',
  [
    body('traineeId').notEmpty(),
    body('jobId').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { traineeId, jobId } = req.body;

      const trainee = await Trainee.findById(traineeId);
      if (!trainee.jobRecommendations.includes(jobId)) {
        trainee.jobRecommendations.push(jobId);
        await trainee.save();
      }

      const job = await Job.findById(jobId).populate('organization');

      await Notification.create({
        recipient: traineeId,
        recipientModel: 'Trainee',
        type: 'job-recommendation',
        title: 'Job Recommendation',
        message: `You have been recommended for: ${job.title} at ${job.organization.name}`,
        relatedTo: jobId
      });

      res.status(200).json({ message: 'Job recommended successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Get all organizations
router.get('/organizations', async (req, res, next) => {
  try {
    const organizations = await Organization.find().populate('jobs');

    res.status(200).json(organizations);
  } catch (error) {
    next(error);
  }
});

// Create an organization
router.post(
  '/organizations',
  [
    body('name').notEmpty(),
    body('location').notEmpty(),
    body('contactEmail').isEmail(),
    body('contactPhone').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, location, description, contactEmail, contactPhone, website } = req.body;

      const organization = await Organization.create({
        name,
        location,
        description,
        contactEmail,
        contactPhone,
        website,
        createdBy: req.user.id
      });

      res.status(201).json({ message: 'Organization created successfully', organization });
    } catch (error) {
      next(error);
    }
  }
);

// Update an organization
router.put(
  '/organizations/:id',
  [
    body('name').optional(),
    body('location').optional(),
    body('contactEmail').optional().isEmail(),
    body('contactPhone').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organization = await Organization.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      res.status(200).json({ message: 'Organization updated successfully', organization });
    } catch (error) {
      next(error);
    }
  }
);

// Get all active jobs
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('organization')
      .populate('recommendedTo');

    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
});

// Create a job post
router.post(
  '/jobs',
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('skillsRequired').notEmpty(),
    body('organization').notEmpty(),
    body('location').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const job = await Job.create({
        ...req.body,
        postedBy: req.user.id
      });

      const organization = await Organization.findById(req.body.organization);
      if (organization) {
        organization.jobs.push(job._id);
        organization.numberOfJobs += 1;
        await organization.save();
      }

      res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
      next(error);
    }
  }
);

export default router;