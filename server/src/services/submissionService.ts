import { Types } from 'mongoose';
import { Submission, ISubmission } from '../models/Submission';
import { Problem } from '../models/Problem';
import { judge0Service } from './judge0Service';
import { runCodeLocally } from './localCodeRunner';
import { problemService } from './problemService';
import { AppError } from '../middleware/errorHandler';
import { LANGUAGE_IDS } from '@flowcode/shared';
import type { SubmissionStatus, TestCaseResult } from '@flowcode/shared';

interface RunCodeParams {
  userId: string;
  problemId: string;
  code: string;
  language: string;
  customInput?: string;
}

interface SubmitCodeParams extends RunCodeParams {
  timeSpent: number;
  hintsUsed?: number[];
}

interface ExecutionResult {
  submissionId: string;
  status: SubmissionStatus;
  testCaseResults: TestCaseResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime: number;
  memoryUsed: number;
  error?: string;
}

export class SubmissionService {
  /**
   * Run code against visible test cases only (for "Run" button)
   */
  async runCode(params: RunCodeParams): Promise<ExecutionResult> {
    const { userId, problemId, code, language, customInput } = params;

    // Validate problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // Get language ID for Judge0
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      throw new AppError(`Unsupported language: ${language}`, 400);
    }

    // Get visible test cases only
    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);

    // If custom input provided, use only that
    const testCasesToRun = customInput
      ? [{ input: customInput, expectedOutput: '', isHidden: false }]
      : visibleTestCases;

    if (testCasesToRun.length === 0) {
      throw new AppError('No test cases available', 400);
    }

    // Execute code
    let results: TestCaseResult[];

    if (judge0Service.isAvailable()) {
      results = await this.executeWithJudge0(
        code,
        languageId,
        testCasesToRun.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }))
      );
    } else {
      // Use local code execution
      const localResults = await runCodeLocally(
        code,
        language,
        testCasesToRun.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        }))
      );
      results = localResults.testCaseResults;
    }

    // Calculate totals
    const passedTestCases = results.filter((r) => r.passed).length;
    const totalExecutionTime = results.reduce(
      (sum, r) => sum + (r.executionTime || 0),
      0
    );
    const maxMemory = Math.max(...results.map((r) => r.memoryUsed || 0));

    // Determine overall status
    const status = this.determineOverallStatus(results);

    return {
      submissionId: '', // Not saved for run
      status,
      testCaseResults: results,
      totalTestCases: results.length,
      passedTestCases,
      executionTime: totalExecutionTime,
      memoryUsed: maxMemory,
    };
  }

  /**
   * Submit code for full evaluation (all test cases)
   */
  async submitCode(params: SubmitCodeParams): Promise<ExecutionResult> {
    const { userId, problemId, code, language, timeSpent, hintsUsed } = params;

    // Validate problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // Get language ID for Judge0
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      throw new AppError(`Unsupported language: ${language}`, 400);
    }

    // Get attempt number
    const previousAttempts = await Submission.countDocuments({
      userId: new Types.ObjectId(userId),
      problemId: new Types.ObjectId(problemId),
    });

    // Create submission record
    const submission = new Submission({
      userId: new Types.ObjectId(userId),
      problemId: new Types.ObjectId(problemId),
      code,
      language,
      languageId,
      status: 'running',
      totalTestCases: problem.testCases.length,
      hintsUsed: hintsUsed || [],
      attemptNumber: previousAttempts + 1,
      timeSpent,
      submittedAt: new Date(),
    });

    await submission.save();

    // Execute against ALL test cases
    let results: TestCaseResult[];

    if (judge0Service.isAvailable()) {
      results = await this.executeWithJudge0(
        code,
        languageId,
        problem.testCases.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }))
      );
    } else {
      // Use local code execution
      const localResults = await runCodeLocally(
        code,
        language,
        problem.testCases.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        }))
      );
      results = localResults.testCaseResults;
    }

    // Calculate totals
    const passedTestCases = results.filter((r) => r.passed).length;
    const totalExecutionTime = results.reduce(
      (sum, r) => sum + (r.executionTime || 0),
      0
    );
    const maxMemory = Math.max(...results.map((r) => r.memoryUsed || 0));

    // Determine overall status
    const status = this.determineOverallStatus(results);

    // Update submission with results
    submission.status = status;
    submission.testCaseResults = results;
    submission.passedTestCases = passedTestCases;
    submission.executionTime = totalExecutionTime;
    submission.memoryUsed = maxMemory;
    submission.completedAt = new Date();

    await submission.save();

    // Update problem success rate
    await problemService.updateSuccessRate(problemId, status === 'accepted');

    return {
      submissionId: submission._id.toString(),
      status,
      testCaseResults: results.map((r, i) => ({
        ...r,
        // Hide actual output for hidden test cases
        actualOutput: problem.testCases[i]?.isHidden ? undefined : r.actualOutput,
        expectedOutput: problem.testCases[i]?.isHidden
          ? undefined
          : r.expectedOutput,
      })),
      totalTestCases: problem.testCases.length,
      passedTestCases,
      executionTime: totalExecutionTime,
      memoryUsed: maxMemory,
    };
  }

  /**
   * Execute code with Judge0 API
   */
  private async executeWithJudge0(
    code: string,
    languageId: number,
    testCases: Array<{ input: string; expectedOutput: string }>
  ): Promise<TestCaseResult[]> {
    try {
      // Create batch submission
      const tokens = await judge0Service.createBatchSubmission(
        code,
        languageId,
        testCases
      );

      // Wait a bit for processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Poll for results
      let attempts = 0;
      const maxAttempts = 15;
      let allComplete = false;
      let results: TestCaseResult[] = [];

      while (!allComplete && attempts < maxAttempts) {
        const batchResults = await judge0Service.getBatchSubmissions(tokens);

        allComplete = batchResults.every(
          (r) => r.status.id !== 1 && r.status.id !== 2
        );

        if (allComplete) {
          results = batchResults.map((result, index) => {
            const processed = judge0Service.processResult(
              result,
              testCases[index].expectedOutput,
              index
            );
            return {
              testCaseIndex: index,
              passed: processed.passed,
              actualOutput: processed.actualOutput,
              expectedOutput: processed.expectedOutput,
              executionTime: processed.executionTime,
              memoryUsed: processed.memoryUsed,
              error: processed.error,
            };
          });
        } else {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!allComplete) {
        throw new Error('Execution timed out');
      }

      return results;
    } catch (error) {
      console.error('Judge0 execution error:', error);
      throw new AppError('Code execution failed. Please try again.', 500);
    }
  }

  /**
   * Determine overall status from test case results
   */
  private determineOverallStatus(results: TestCaseResult[]): SubmissionStatus {
    if (results.length === 0) return 'runtime-error';

    // Check for any compilation errors first
    const hasCompilationError = results.some((r) => r.error?.includes('compil'));
    if (hasCompilationError) return 'compilation-error';

    // Check for runtime errors
    const hasRuntimeError = results.some(
      (r) => r.error && !r.error.includes('compil')
    );
    if (hasRuntimeError) return 'runtime-error';

    // Check if all passed
    const allPassed = results.every((r) => r.passed);
    if (allPassed) return 'accepted';

    // Check for TLE
    const hasTLE = results.some((r) => (r.executionTime || 0) > 2000);
    if (hasTLE) return 'time-limit-exceeded';

    return 'wrong-answer';
  }

  /**
   * Get submission by ID
   */
  async getSubmission(submissionId: string): Promise<ISubmission | null> {
    return Submission.findById(submissionId);
  }

  /**
   * Get user's submission history for a problem
   */
  async getSubmissionHistory(
    userId: string,
    problemId?: string,
    limit: number = 20
  ): Promise<ISubmission[]> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (problemId) {
      query.problemId = new Types.ObjectId(problemId);
    }

    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .populate('problemId', 'title slug difficulty')
      .lean();

    return submissions as unknown as ISubmission[];
  }

  /**
   * Get user's latest submission for a problem
   */
  async getLatestSubmission(
    userId: string,
    problemId: string
  ): Promise<ISubmission | null> {
    const submission = await Submission.findOne({
      userId: new Types.ObjectId(userId),
      problemId: new Types.ObjectId(problemId),
    })
      .sort({ submittedAt: -1 })
      .lean();

    return submission as unknown as ISubmission | null;
  }
}

export const submissionService = new SubmissionService();
