import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  skillSummary: {
    overallLevel: number;
    weakestConcepts: string[];
    strongestConcepts: string[];
    lastActiveAt: Date;
  };
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
    skillSummary: {
      overallLevel: { type: Number, default: 0, min: 0, max: 100 },
      weakestConcepts: [{ type: String }],
      strongestConcepts: [{ type: String }],
      lastActiveAt: { type: Date, default: Date.now },
    },
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
