import mongoose, { Schema, Document, Types } from 'mongoose';
import type { SubmissionStatus, TestCaseResult } from '@flowcode/shared';

export interface ISubmission extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  code: string;
  language: string;
  languageId: number;
  status: SubmissionStatus;
  testCaseResults: TestCaseResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime: number;
  memoryUsed: number;
  judge0Tokens: string[];
  hintsUsed: number[];
  attemptNumber: number;
  timeSpent: number;
  submittedAt: Date;
  completedAt?: Date;
}

const TestCaseResultSchema = new Schema<TestCaseResult>(
  {
    testCaseIndex: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    actualOutput: { type: String },
    expectedOutput: { type: String },
    executionTime: { type: Number },
    memoryUsed: { type: Number },
    error: { type: String },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    code: { type: String, required: true },
    language: { type: String, required: true },
    languageId: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'pending',
        'running',
        'accepted',
        'wrong-answer',
        'time-limit-exceeded',
        'memory-limit-exceeded',
        'runtime-error',
        'compilation-error',
      ],
      default: 'pending',
    },
    testCaseResults: [TestCaseResultSchema],
    totalTestCases: { type: Number, default: 0 },
    passedTestCases: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 },
    memoryUsed: { type: Number, default: 0 },
    judge0Tokens: [{ type: String }],
    hintsUsed: [{ type: Number }],
    attemptNumber: { type: Number, default: 1 },
    timeSpent: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for user's problem history
SubmissionSchema.index({ userId: 1, problemId: 1, submittedAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
