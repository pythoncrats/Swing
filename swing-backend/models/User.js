const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    documentUrl: { type: String, default: null } // uploaded proof/certificate
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['trainee', 'trainer', 'admin'],
      required: true
    },

    // ---- Shared basic profile fields ----
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },

    // ---- Email/OTP verification ----
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLockUntil: { type: Date, select: false },

    // ================= TRAINEE-ONLY FIELDS =================
    hasSkills: { type: Boolean, default: null }, // null = not answered yet
    skills: { type: [skillSchema], default: [] }, // used when hasSkills = true
    skillsOfInterest: { type: [String], default: [] }, // used when hasSkills = false

    trainingStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'certified'],
      default: 'not_started'
    },

    // Registration/admin review pipeline status
    registrationStatus: {
      type: String,
      enum: ['pending', 'assigned', 'rejected'],
      default: 'pending'
    },
    rejectionReason: { type: String, default: '' },

    assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    recommendedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // ================= TRAINER-ONLY FIELDS =================
    bio: { type: String, default: '' },
    trainerSkills: { type: [String], default: [] }, // visible to admin + own profile
    educationStatus: { type: String, default: '' }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never leak sensitive fields in JSON responses
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otpCode;
  delete obj.otpExpires;
  delete obj.otpAttempts;
  delete obj.otpLockUntil;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
