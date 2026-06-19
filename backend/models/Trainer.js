import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assignedTrainees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainee' }],
  certifiedTrainees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainee' }],
  failedTrainees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainee' }]
}, { timestamps: true });

export default mongoose.model('Trainer', trainerSchema);