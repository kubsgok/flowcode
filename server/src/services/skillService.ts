import { Types } from 'mongoose';
import { UserSkillProfile, IUserSkillProfile } from '../models/UserSkillProfile';
import { Problem } from '../models/Problem';
import { User, ISelfAssessment } from '../models/User';
import type { Concept } from '@flowcode/shared';

// Skill update constants
const BASE_SKILL_GAIN = 10; // Base points gained on successful solve
const SKILL_LOSS = 5; // Points lost on failed attempt
const HINT_PENALTY = 0.15; // 15% reduction per hint used
const DIFFICULTY_MULTIPLIER = {
  easy: 0.8,
  medium: 1.0,
  hard: 1.3,
};

// Self-assessment to skill level conversion
// Rating 1 = 0, Rating 5 = 60 (leave room to grow through practice)
const SELF_RATING_TO_SKILL: Record<number, number> = {
  1: 0,   // Never heard of it
  2: 15,  // Heard of it, never used
  3: 30,  // Used it a few times
  4: 45,  // Pretty comfortable
  5: 60,  // Could teach this
};

// Map self-assessment keys to concept slugs
const ASSESSMENT_TO_CONCEPT: Record<keyof ISelfAssessment, Concept> = {
  arrays: 'arrays',
  strings: 'strings',
  hashmaps: 'hashmaps',
  twoPointers: 'two-pointers',
  slidingWindow: 'sliding-window',
  linkedLists: 'linked-lists',
  trees: 'trees',
  graphs: 'graphs',
  dynamicProgramming: 'dynamic-programming',
  recursion: 'recursion',
};

export class SkillService {
  /**
   * Get or create a skill profile for a user
   */
  async getOrCreateProfile(userId: string): Promise<IUserSkillProfile> {
    let profile = await UserSkillProfile.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!profile) {
      profile = await UserSkillProfile.create({
        userId: new Types.ObjectId(userId),
        conceptScores: new Map(),
        overallScore: 0,
        totalProblemsSolved: 0,
        totalProblemsAttempted: 0,
      });
    }

    return profile;
  }

  /**
   * Update skills after a submission
   */
  async updateSkillsAfterSubmission(
    userId: string,
    problemId: string,
    passed: boolean,
    hintsUsed: number[] = [],
    isFirstSolve: boolean = false
  ): Promise<void> {
    const problem = await Problem.findById(problemId);
    if (!problem) return;

    const profile = await this.getOrCreateProfile(userId);
    const concepts = [...problem.concepts, ...(problem.secondaryConcepts || [])] as Concept[];
    const difficultyMult = DIFFICULTY_MULTIPLIER[problem.difficulty] || 1.0;
    const hintPenalty = 1 - hintsUsed.length * HINT_PENALTY;

    for (const concept of concepts) {
      let conceptScore = profile.conceptScores.get(concept);

      if (!conceptScore) {
        conceptScore = {
          score: 0,
          problemsSolved: 0,
          problemsAttempted: 0,
          lastPracticed: new Date(),
        };
      }

      if (passed) {
        // Calculate skill gain
        const gain = BASE_SKILL_GAIN * difficultyMult * Math.max(0.5, hintPenalty);

        // Apply diminishing returns - harder to gain at higher levels
        const diminishingFactor = 1 - conceptScore.score / 150; // Slower gain above 66%
        const adjustedGain = gain * Math.max(0.2, diminishingFactor);

        conceptScore.score = Math.min(100, conceptScore.score + adjustedGain);

        if (isFirstSolve) {
          conceptScore.problemsSolved += 1;
        }
      } else {
        // Skill loss on failure (but not below 0)
        conceptScore.score = Math.max(0, conceptScore.score - SKILL_LOSS);
        conceptScore.problemsAttempted += 1;
      }

      conceptScore.lastPracticed = new Date();
      profile.conceptScores.set(concept, conceptScore);
    }

    // Update totals
    if (passed && isFirstSolve) {
      profile.totalProblemsSolved += 1;
    }
    if (!passed) {
      profile.totalProblemsAttempted += 1;
    }

    // Recalculate overall score (weighted average of concept scores)
    const scores = Array.from(profile.conceptScores.values()).map((c) => c.score);
    profile.overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    await profile.save();

    // Also update the user's skillSummary for quick access
    await this.updateUserSkillSummary(userId, profile);
  }

  /**
   * Update the User's skillSummary field for quick access
   */
  private async updateUserSkillSummary(
    userId: string,
    profile: IUserSkillProfile
  ): Promise<void> {
    // Find weakest and strongest concepts
    const conceptEntries = Array.from(profile.conceptScores.entries());

    if (conceptEntries.length === 0) return;

    // Sort by score
    conceptEntries.sort((a, b) => a[1].score - b[1].score);

    const weakestConcepts = conceptEntries
      .slice(0, 3)
      .filter(([, data]) => data.score < 50)
      .map(([concept]) => concept);

    const strongestConcepts = conceptEntries
      .slice(-3)
      .reverse()
      .filter(([, data]) => data.score >= 50)
      .map(([concept]) => concept);

    await User.findByIdAndUpdate(userId, {
      'skillSummary.overallLevel': profile.overallScore,
      'skillSummary.weakestConcepts': weakestConcepts,
      'skillSummary.strongestConcepts': strongestConcepts,
      'skillSummary.lastActiveAt': new Date(),
    });
  }

  /**
   * Get a user's skill profile
   */
  async getSkillProfile(userId: string): Promise<IUserSkillProfile | null> {
    return UserSkillProfile.findOne({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Get the weakest concepts for a user (for recommendations)
   */
  async getWeakestConcepts(userId: string, limit: number = 3): Promise<Concept[]> {
    const profile = await this.getSkillProfile(userId);
    if (!profile) return [];

    const conceptEntries = Array.from(profile.conceptScores.entries());
    conceptEntries.sort((a, b) => a[1].score - b[1].score);

    return conceptEntries.slice(0, limit).map(([concept]) => concept as Concept);
  }

  /**
   * Initialize skill profile from self-assessment questionnaire
   * Called when a user completes guided mode onboarding
   */
  async initializeFromSelfAssessment(
    userId: string,
    selfAssessment: ISelfAssessment
  ): Promise<IUserSkillProfile> {
    const userObjectId = new Types.ObjectId(userId);

    // Delete existing profile if any (fresh start from self-assessment)
    await UserSkillProfile.deleteOne({ userId: userObjectId });

    // Create concept scores map from self-assessment
    const conceptScores = new Map<string, {
      score: number;
      problemsSolved: number;
      problemsAttempted: number;
      lastPracticed: Date;
    }>();

    for (const [assessmentKey, conceptSlug] of Object.entries(ASSESSMENT_TO_CONCEPT)) {
      const rating = selfAssessment[assessmentKey as keyof ISelfAssessment];
      const skillScore = SELF_RATING_TO_SKILL[rating] || 0;

      conceptScores.set(conceptSlug, {
        score: skillScore,
        problemsSolved: 0,
        problemsAttempted: 0,
        lastPracticed: new Date(),
      });
    }

    // Calculate overall score (average of all concept scores)
    const scores = Array.from(conceptScores.values()).map((c) => c.score);
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Create new profile
    const profile = await UserSkillProfile.create({
      userId: userObjectId,
      conceptScores,
      overallScore,
      totalProblemsSolved: 0,
      totalProblemsAttempted: 0,
    });

    // Update user's skillSummary
    await this.updateUserSkillSummary(userId, profile);

    return profile;
  }

  /**
   * Get recommended difficulty based on skill level for a concept
   */
  getRecommendedDifficulty(skillScore: number): 'easy' | 'medium' | 'hard' {
    if (skillScore < 25) return 'easy';
    if (skillScore < 50) return 'medium';
    return 'hard';
  }

  /**
   * Get all concept scores for a user (for display)
   */
  async getAllConceptScores(userId: string): Promise<Record<string, number>> {
    const profile = await this.getSkillProfile(userId);
    if (!profile) return {};

    const scores: Record<string, number> = {};
    for (const [concept, data] of profile.conceptScores.entries()) {
      scores[concept] = data.score;
    }
    return scores;
  }
}

export const skillService = new SkillService();
