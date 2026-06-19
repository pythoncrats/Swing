import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  website: { type: String },
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  numberOfJobs: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Organization', organizationSchema);