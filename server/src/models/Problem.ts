import mongoose, { Schema, Document } from 'mongoose';
import type { Difficulty, Concept, TestCase, Hint, Example } from '@flowcode/shared';

export interface IProblem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  constraints: string[];
  examples: Example[];
  difficulty: Difficulty;
  difficultyScore: number;
  concepts: Concept[];
  secondaryConcepts: Concept[];
  testCases: TestCase[];
  hints: Hint[];
  starterCode: Map<string, string>;
  solution: Map<string, string>;
  solutionExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  successRate: number;
  averageTime: number;
  popularity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<TestCase>(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    explanation: { type: String },
  },
  { _id: false }
);

const HintSchema = new Schema<Hint>(
  {
    level: { type: Number, enum: [1, 2, 3], required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const ExampleSchema = new Schema<Example>(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    constraints: [{ type: String }],
    examples: [ExampleSchema],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    difficultyScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    concepts: [
      {
        type: String,
        required: true,
        index: true,
      },
    ],
    secondaryConcepts: [{ type: String }],
    testCases: [TestCaseSchema],
    hints: [HintSchema],
    starterCode: {
      type: Map,
      of: String,
      default: new Map(),
    },
    solution: {
      type: Map,
      of: String,
      default: new Map(),
    },
    solutionExplanation: { type: String, default: '' },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    successRate: { type: Number, default: 0, min: 0, max: 100 },
    averageTime: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
ProblemSchema.index({ concepts: 1, difficulty: 1, difficultyScore: 1 });
ProblemSchema.index({ slug: 1 });
ProblemSchema.index({ isActive: 1, difficulty: 1 });

// Generate slug from title before saving
ProblemSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
