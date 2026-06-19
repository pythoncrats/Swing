import mongoose from 'mongoose';

const traineeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  trainingStatus: { type: String, enum: ['unassigned', 'assigned', 'certified', 'failed'], default: 'unassigned' },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  existingSkills: [{ type: String }],
  skillsOfInterest: [{ type: String }],
  jobRecommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  certificationDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Trainee', traineeSchema);