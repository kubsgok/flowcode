import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Self-assessment ratings (1-5 scale)
export interface ISelfAssessment {
  arrays: number;
  strings: number;
  hashmaps: number;
  twoPointers: number;
  slidingWindow: number;
  linkedLists: number;
  trees: number;
  graphs: number;
  dynamicProgramming: number;
  recursion: number;
}

// Guided mode progress tracking
export interface IGuidedProgress {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date | null;
  totalChallengesCompleted: number;
  // Track the current daily challenge
  dailyChallengeProblemId: mongoose.Types.ObjectId | null;
  dailyChallengeDate: Date | null;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  preferences: {
    preferredLanguage: string;
    editorTheme: string;
    fontSize: number;
  };
  // Mode selection and onboarding
  preferredMode: 'guided' | 'practice' | null;
  onboardingComplete: boolean;
  selfAssessment: ISelfAssessment | null;
  // Guided mode progress
  guidedProgress: IGuidedProgress;
  skillSummary: {
    overallLevel: number;
    weakestConcepts: string[];
    strongestConcepts: string[];
    lastActiveAt: Date;
  };
  // Problem progress tracking
  solvedProblems: mongoose.Types.ObjectId[];
  attemptedProblems: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      minlength: [2, 'Display name must be at least 2 characters'],
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    preferences: {
      preferredLanguage: { type: String, default: 'python' },
      editorTheme: { type: String, default: 'vs-dark' },
      fontSize: { type: Number, default: 14, min: 10, max: 24 },
    },
    // Mode selection and onboarding
    preferredMode: {
      type: String,
      enum: ['guided', 'practice', null],
      default: null,
    },
    onboardingComplete: { type: Boolean, default: false },
    selfAssessment: {
      arrays: { type: Number, min: 1, max: 5 },
      strings: { type: Number, min: 1, max: 5 },
      hashmaps: { type: Number, min: 1, max: 5 },
      twoPointers: { type: Number, min: 1, max: 5 },
      slidingWindow: { type: Number, min: 1, max: 5 },
      linkedLists: { type: Number, min: 1, max: 5 },
      trees: { type: Number, min: 1, max: 5 },
      graphs: { type: Number, min: 1, max: 5 },
      dynamicProgramming: { type: Number, min: 1, max: 5 },
      recursion: { type: Number, min: 1, max: 5 },
    },
    // Guided mode progress
    guidedProgress: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastCompletedDate: { type: Date, default: null },
      totalChallengesCompleted: { type: Number, default: 0 },
      dailyChallengeProblemId: { type: Schema.Types.ObjectId, ref: 'Problem', default: null },
      dailyChallengeDate: { type: Date, default: null },
    },
    skillSummary: {
      overallLevel: { type: Number, default: 0, min: 0, max: 100 },
      weakestConcepts: [{ type: String }],
      strongestConcepts: [{ type: String }],
      lastActiveAt: { type: Date, default: Date.now },
    },
    // Problem progress tracking
    solvedProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    attemptedProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
