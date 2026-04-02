import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  workspaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
  }],
  // ── Streak tracking ────────────────────────────────────
  lastActiveDate: {
    type: Date,
    default: null,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/**
 * updateStreak — call on every login / meaningful activity.
 * Returns the updated user (not saved yet, call save() after).
 */
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActiveDate) {
    // First ever activity
    this.currentStreak = 1;
  } else {
    const last = new Date(this.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - last) / 86400000);

    if (diffDays === 0) {
      // Same day — streak unchanged
    } else if (diffDays === 1) {
      // Consecutive day
      this.currentStreak += 1;
    } else {
      // Gap — reset streak
      this.currentStreak = 1;
    }
  }

  this.lastActiveDate = today;
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  return this;
};

const User = mongoose.model('User', userSchema);
export default User;
