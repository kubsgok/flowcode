import { Types } from 'mongoose';
import { Problem } from '../models/Problem';
import { User } from '../models/User';
import { skillService } from './skillService';
import type { Concept, Difficulty } from '@flowcode/shared';

interface RecommendedProblem {
  problemId: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  concepts: Concept[];
  reason: string;
  targetConcept: Concept;
  skillScore: number;
}

export class RecommendationService {
  /**
   * Get a recommended problem for a user based on their skill profile
   * Prioritizes weakest concepts and appropriate difficulty
   */
  async getRecommendedProblem(userId: string): Promise<RecommendedProblem | null> {
    // Get user's solved problems
    const user = await User.findById(userId).select('solvedProblems');
    const solvedProblemIds = new Set(
      (user?.solvedProblems || []).map((id) => id.toString())
    );

    // Get user's skill profile
    const profile = await skillService.getSkillProfile(userId);
    if (!profile) {
      // No skill profile - return any easy problem
      return this.getEasyProblemForBeginner(solvedProblemIds);
    }

    // Get concept scores sorted by weakest first
    const conceptEntries = Array.from(profile.conceptScores.entries());
    conceptEntries.sort((a, b) => a[1].score - b[1].score);

    // Try to find a problem for each concept, starting with weakest
    for (const [concept, scoreData] of conceptEntries) {
      const targetDifficulty = skillService.getRecommendedDifficulty(scoreData.score);

      // Find an unsolved problem for this concept at appropriate difficulty
      const problem = await Problem.findOne({
        _id: { $nin: Array.from(solvedProblemIds).map((id) => new Types.ObjectId(id)) },
        concepts: concept,
        difficulty: targetDifficulty,
        isActive: true,
      }).lean();

      if (problem) {
        return {
          problemId: problem._id.toString(),
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          concepts: problem.concepts as Concept[],
          reason: this.generateReason(concept as Concept, scoreData.score, targetDifficulty),
          targetConcept: concept as Concept,
          skillScore: scoreData.score,
        };
      }

      // If no problem at target difficulty, try adjacent difficulties
      const alternativeDifficulties = this.getAlternativeDifficulties(targetDifficulty);
      for (const altDifficulty of alternativeDifficulties) {
        const altProblem = await Problem.findOne({
          _id: { $nin: Array.from(solvedProblemIds).map((id) => new Types.ObjectId(id)) },
          concepts: concept,
          difficulty: altDifficulty,
          isActive: true,
        }).lean();

        if (altProblem) {
          return {
            problemId: altProblem._id.toString(),
            slug: altProblem.slug,
            title: altProblem.title,
            difficulty: altProblem.difficulty,
            concepts: altProblem.concepts as Concept[],
            reason: this.generateReason(concept as Concept, scoreData.score, altDifficulty),
            targetConcept: concept as Concept,
            skillScore: scoreData.score,
          };
        }
      }
    }

    // No problems found for any concept - return any unsolved problem
    return this.getAnyUnsolvedProblem(solvedProblemIds);
  }

  /**
   * Get multiple recommended problems (for a "recommended for you" section)
   */
  async getRecommendedProblems(
    userId: string,
    limit: number = 3
  ): Promise<RecommendedProblem[]> {
    const recommendations: RecommendedProblem[] = [];
    const usedProblemIds = new Set<string>();

    // Get user's solved problems
    const user = await User.findById(userId).select('solvedProblems');
    const solvedProblemIds = new Set(
      (user?.solvedProblems || []).map((id) => id.toString())
    );

    // Get user's skill profile
    const profile = await skillService.getSkillProfile(userId);
    if (!profile) {
      // No skill profile - return easy problems
      const problems = await Problem.find({
        _id: { $nin: Array.from(solvedProblemIds).map((id) => new Types.ObjectId(id)) },
        difficulty: 'easy',
        isActive: true,
      })
        .limit(limit)
        .lean();

      return problems.map((p) => ({
        problemId: p._id.toString(),
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        concepts: p.concepts as Concept[],
        reason: 'Great starting point for beginners',
        targetConcept: p.concepts[0] as Concept,
        skillScore: 0,
      }));
    }

    // Get concept scores sorted by weakest first
    const conceptEntries = Array.from(profile.conceptScores.entries());
    conceptEntries.sort((a, b) => a[1].score - b[1].score);

    // Get one problem per weak concept
    for (const [concept, scoreData] of conceptEntries) {
      if (recommendations.length >= limit) break;

      const targetDifficulty = skillService.getRecommendedDifficulty(scoreData.score);

      const excludeIds = [
        ...Array.from(solvedProblemIds),
        ...Array.from(usedProblemIds),
      ].map((id) => new Types.ObjectId(id));

      const problem = await Problem.findOne({
        _id: { $nin: excludeIds },
        concepts: concept,
        difficulty: targetDifficulty,
        isActive: true,
      }).lean();

      if (problem) {
        usedProblemIds.add(problem._id.toString());
        recommendations.push({
          problemId: problem._id.toString(),
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          concepts: problem.concepts as Concept[],
          reason: this.generateReason(concept as Concept, scoreData.score, targetDifficulty),
          targetConcept: concept as Concept,
          skillScore: scoreData.score,
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate a human-readable reason for the recommendation
   */
  private generateReason(
    concept: Concept,
    skillScore: number,
    difficulty: Difficulty
  ): string {
    const conceptLabel = this.getConceptLabel(concept);

    if (skillScore < 15) {
      return `Build your foundation in ${conceptLabel}`;
    } else if (skillScore < 30) {
      return `Practice ${conceptLabel} to strengthen your skills`;
    } else if (skillScore < 50) {
      return `Challenge yourself with ${conceptLabel}`;
    } else if (skillScore < 70) {
      return `Level up your ${conceptLabel} mastery`;
    } else {
      return `Master advanced ${conceptLabel} techniques`;
    }
  }

  /**
   * Get alternative difficulties to try if target difficulty has no problems
   */
  private getAlternativeDifficulties(target: Difficulty): Difficulty[] {
    switch (target) {
      case 'easy':
        return ['medium'];
      case 'medium':
        return ['easy', 'hard'];
      case 'hard':
        return ['medium'];
      default:
        return [];
    }
  }

  /**
   * Get any easy problem for a beginner with no skill profile
   */
  private async getEasyProblemForBeginner(
    solvedProblemIds: Set<string>
  ): Promise<RecommendedProblem | null> {
    const problem = await Problem.findOne({
      _id: { $nin: Array.from(solvedProblemIds).map((id) => new Types.ObjectId(id)) },
      difficulty: 'easy',
      isActive: true,
    })
      .sort({ popularity: -1 })
      .lean();

    if (!problem) return null;

    return {
      problemId: problem._id.toString(),
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      concepts: problem.concepts as Concept[],
      reason: 'Great starting point for beginners',
      targetConcept: problem.concepts[0] as Concept,
      skillScore: 0,
    };
  }

  /**
   * Get any unsolved problem as a fallback
   */
  private async getAnyUnsolvedProblem(
    solvedProblemIds: Set<string>
  ): Promise<RecommendedProblem | null> {
    const problem = await Problem.findOne({
      _id: { $nin: Array.from(solvedProblemIds).map((id) => new Types.ObjectId(id)) },
      isActive: true,
    })
      .sort({ difficulty: 1, popularity: -1 })
      .lean();

    if (!problem) return null;

    return {
      problemId: problem._id.toString(),
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      concepts: problem.concepts as Concept[],
      reason: 'Keep practicing to improve your skills',
      targetConcept: problem.concepts[0] as Concept,
      skillScore: 0,
    };
  }

  /**
   * Get human-readable concept label
   */
  private getConceptLabel(concept: Concept): string {
    const labels: Record<Concept, string> = {
      arrays: 'Arrays',
      strings: 'Strings',
      hashmaps: 'Hash Maps',
      'two-pointers': 'Two Pointers',
      'sliding-window': 'Sliding Window',
      'linked-lists': 'Linked Lists',
      trees: 'Trees',
      'binary-trees': 'Binary Trees',
      graphs: 'Graphs',
      bfs: 'BFS',
      dfs: 'DFS',
      'dynamic-programming': 'Dynamic Programming',
      greedy: 'Greedy',
      recursion: 'Recursion',
      backtracking: 'Backtracking',
      'binary-search': 'Binary Search',
      sorting: 'Sorting',
      heaps: 'Heaps',
      tries: 'Tries',
      'bit-manipulation': 'Bit Manipulation',
      sets: 'Sets',
      stacks: 'Stacks',
      queues: 'Queues',
    };

    return labels[concept] || concept;
  }

  /**
   * Get a specific problem by ID formatted as a RecommendedProblem
   * Used for retrieving an already-assigned daily challenge
   */
  async getRecommendedProblemById(
    userId: string,
    problemId: string
  ): Promise<RecommendedProblem | null> {
    const problem = await Problem.findById(problemId).lean();
    if (!problem) return null;

    // Get user's skill profile for the reason
    const profile = await skillService.getSkillProfile(userId);
    const concept = problem.concepts[0] as Concept;
    let skillScore = 0;

    if (profile?.conceptScores) {
      const conceptData = profile.conceptScores.get(concept);
      skillScore = conceptData?.score || 0;
    }

    return {
      problemId: problem._id.toString(),
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      concepts: problem.concepts as Concept[],
      reason: this.generateReason(concept, skillScore, problem.difficulty),
      targetConcept: concept,
      skillScore,
    };
  }
}

export const recommendationService = new RecommendationService();
