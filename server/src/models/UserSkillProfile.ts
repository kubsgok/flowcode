import mongoose, { Schema, Document } from 'mongoose';
import type { Concept } from '@flowcode/shared';

export interface IConceptScore {
  score: number; // 0-100
  problemsSolved: number;
  problemsAttempted: number;
  lastPracticed: Date;
}

export interface IUserSkillProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  conceptScores: Map<string, IConceptScore>;
  overallScore: number;
  totalProblemsSolved: number;
  totalProblemsAttempted: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConceptScoreSchema = new Schema<IConceptScore>(
  {
    score: { type: Number, default: 0, min: 0, max: 100 },
    problemsSolved: { type: Number, default: 0 },
    problemsAttempted: { type: Number, default: 0 },
    lastPracticed: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSkillProfileSchema = new Schema<IUserSkillProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    conceptScores: {
      type: Map,
      of: ConceptScoreSchema,
      default: new Map(),
    },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    totalProblemsSolved: { type: Number, default: 0 },
    totalProblemsAttempted: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Helper to get or create a concept score
UserSkillProfileSchema.methods.getConceptScore = function (
  concept: Concept
): IConceptScore {
  if (!this.conceptScores.has(concept)) {
    this.conceptScores.set(concept, {
      score: 0,
      problemsSolved: 0,
      problemsAttempted: 0,
      lastPracticed: new Date(),
    });
  }
  return this.conceptScores.get(concept)!;
};

export const UserSkillProfile = mongoose.model<IUserSkillProfile>(
  'UserSkillProfile',
  UserSkillProfileSchema
);
