import { Problem, IProblem } from '../models/Problem';
import { AppError } from '../middleware/errorHandler';
import type { Difficulty, Concept } from '@flowcode/shared';

interface ProblemFilters {
  difficulty?: Difficulty;
  concepts?: Concept[];
  search?: string;
  isActive?: boolean;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'popularity' | 'successRate' | 'createdAt' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProblemService {
  async getProblems(
    filters: ProblemFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<IProblem>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = { isActive: true };

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.concepts && filters.concepts.length > 0) {
      query.concepts = { $in: filters.concepts };
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Build sort
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Problem.find(query)
        .select('-testCases -solution -solutionExplanation')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Problem.countDocuments(query),
    ]);

    return {
      items: items as unknown as IProblem[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProblemBySlug(slug: string): Promise<IProblem> {
    const problem = await Problem.findOne({ slug, isActive: true })
      .select('-solution -solutionExplanation')
      .lean();

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // Filter out hidden test cases for public view
    const visibleTestCases = (problem.testCases || []).filter(
      (tc) => !tc.isHidden
    );

    return {
      ...problem,
      testCases: visibleTestCases,
    } as unknown as IProblem;
  }

  async getProblemById(id: string): Promise<IProblem> {
    const problem = await Problem.findById(id).lean();

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    return problem as unknown as IProblem;
  }

  async getHint(problemId: string, level: 1 | 2 | 3): Promise<string> {
    const problem = await Problem.findById(problemId).select('hints').lean();

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const hint = problem.hints?.find((h) => h.level === level);

    if (!hint) {
      throw new AppError(`Hint level ${level} not available`, 404);
    }

    return hint.content;
  }

  async createProblem(data: Partial<IProblem>): Promise<IProblem> {
    const problem = await Problem.create(data);
    return problem;
  }

  async updateProblem(id: string, data: Partial<IProblem>): Promise<IProblem> {
    const problem = await Problem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    return problem;
  }

  async incrementPopularity(problemId: string): Promise<void> {
    await Problem.findByIdAndUpdate(problemId, {
      $inc: { popularity: 1 },
    });
  }

  async updateSuccessRate(
    problemId: string,
    wasSuccessful: boolean
  ): Promise<void> {
    const problem = await Problem.findById(problemId);
    if (!problem) return;

    // Simple moving average update
    const currentRate = problem.successRate || 0;
    const newRate = wasSuccessful
      ? currentRate + (100 - currentRate) * 0.05
      : currentRate - currentRate * 0.05;

    await Problem.findByIdAndUpdate(problemId, {
      successRate: Math.round(newRate * 100) / 100,
    });
  }

  async getRandomProblem(filters?: ProblemFilters): Promise<IProblem | null> {
    const query: Record<string, unknown> = { isActive: true };

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters?.concepts && filters.concepts.length > 0) {
      query.concepts = { $in: filters.concepts };
    }

    const count = await Problem.countDocuments(query);
    if (count === 0) return null;

    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne(query)
      .skip(random)
      .select('-testCases -solution -solutionExplanation')
      .lean();

    return problem as IProblem | null;
  }
}

export const problemService = new ProblemService();
