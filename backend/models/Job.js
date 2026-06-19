import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: [{ type: String }],
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  location: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recommendedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainee' }]
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);