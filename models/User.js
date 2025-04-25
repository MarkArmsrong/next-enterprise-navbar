import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    index: true, // Index for faster queries
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: false, // Not required for OAuth users
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in queries by default
  },
  image: {
    type: String,
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  // Add provider information to track authentication methods
  authProviders: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true,
});

// Remove the unique constraint on email to allow independent accounts
UserSchema.index({ email: 1, authProviders: 1 }, { unique: true, sparse: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  if (!this.password) return next(); // Skip if no password (OAuth users)
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Check if model exists before defining it (for hot reloading in development)
export default mongoose.models.User || mongoose.model('User', UserSchema);