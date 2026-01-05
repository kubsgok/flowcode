import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import type { SubmissionStatus } from '@flowcode/shared';

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

// Judge0 status IDs
const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

// Map Judge0 status to our status
function mapJudge0Status(statusId: number): SubmissionStatus {
  switch (statusId) {
    case JUDGE0_STATUS.IN_QUEUE:
    case JUDGE0_STATUS.PROCESSING:
      return 'running';
    case JUDGE0_STATUS.ACCEPTED:
      return 'accepted';
    case JUDGE0_STATUS.WRONG_ANSWER:
      return 'wrong-answer';
    case JUDGE0_STATUS.TIME_LIMIT_EXCEEDED:
      return 'time-limit-exceeded';
    case JUDGE0_STATUS.COMPILATION_ERROR:
      return 'compilation-error';
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGXFSZ:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGFPE:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGABRT:
    case JUDGE0_STATUS.RUNTIME_ERROR_NZEC:
    case JUDGE0_STATUS.RUNTIME_ERROR_OTHER:
      return 'runtime-error';
    default:
      return 'runtime-error';
  }
}

export class Judge0Service {
  private client: AxiosInstance;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!config.judge0.apiKey;

    this.client = axios.create({
      baseURL: config.judge0.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': config.judge0.apiKey,
        'X-RapidAPI-Host': config.judge0.apiHost,
      },
    });
  }

  /**
   * Check if Judge0 is properly configured
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Submit code for execution
   * Returns a token to poll for results
   */
  async createSubmission(submission: Judge0Submission): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Judge0 API is not configured. Set JUDGE0_API_KEY in environment.');
    }

    const response = await this.client.post<{ token: string }>(
      '/submissions',
      {
        source_code: Buffer.from(submission.source_code).toString('base64'),
        language_id: submission.language_id,
        stdin: submission.stdin
          ? Buffer.from(submission.stdin).toString('base64')
          : undefined,
        expected_output: submission.expected_output
          ? Buffer.from(submission.expected_output).toString('base64')
          : undefined,
        cpu_time_limit: submission.cpu_time_limit || 2,
        memory_limit: submission.memory_limit || 128000,
      },
      {
        params: { base64_encoded: 'true', wait: 'false' },
      }
    );

    return response.data.token;
  }

  /**
   * Submit multiple test cases in batch
   */
  async createBatchSubmission(
    sourceCode: string,
    languageId: number,
    testCases: Array<{ input: string; expectedOutput: string }>
  ): Promise<string[]> {
    if (!this.isConfigured) {
      throw new Error('Judge0 API is not configured. Set JUDGE0_API_KEY in environment.');
    }

    const submissions = testCases.map((tc) => ({
      source_code: Buffer.from(sourceCode).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(tc.input).toString('base64'),
      expected_output: Buffer.from(tc.expectedOutput).toString('base64'),
      cpu_time_limit: 2,
      memory_limit: 128000,
    }));

    const response = await this.client.post<Array<{ token: string }>>(
      '/submissions/batch',
      { submissions },
      {
        params: { base64_encoded: 'true' },
      }
    );

    return response.data.map((s) => s.token);
  }

  /**
   * Get submission result by token
   */
  async getSubmission(token: string): Promise<Judge0Result> {
    if (!this.isConfigured) {
      throw new Error('Judge0 API is not configured.');
    }

    const response = await this.client.get<Judge0Result>(
      `/submissions/${token}`,
      {
        params: {
          base64_encoded: 'true',
          fields: 'token,stdout,stderr,status,time,memory,compile_output,message',
        },
      }
    );

    const data = response.data;

    // Decode base64 fields
    return {
      ...data,
      stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString() : null,
      stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString() : null,
      compile_output: data.compile_output
        ? Buffer.from(data.compile_output, 'base64').toString()
        : null,
    };
  }

  /**
   * Get multiple submission results
   */
  async getBatchSubmissions(tokens: string[]): Promise<Judge0Result[]> {
    if (!this.isConfigured) {
      throw new Error('Judge0 API is not configured.');
    }

    const response = await this.client.get<{ submissions: Judge0Result[] }>(
      '/submissions/batch',
      {
        params: {
          tokens: tokens.join(','),
          base64_encoded: 'true',
          fields: 'token,stdout,stderr,status,time,memory,compile_output,message',
        },
      }
    );

    return response.data.submissions.map((data) => ({
      ...data,
      stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString() : null,
      stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString() : null,
      compile_output: data.compile_output
        ? Buffer.from(data.compile_output, 'base64').toString()
        : null,
    }));
  }

  /**
   * Poll for submission result until complete
   */
  async waitForResult(
    token: string,
    maxAttempts: number = 20,
    intervalMs: number = 1000
  ): Promise<Judge0Result> {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getSubmission(token);

      // Check if processing is complete
      if (
        result.status.id !== JUDGE0_STATUS.IN_QUEUE &&
        result.status.id !== JUDGE0_STATUS.PROCESSING
      ) {
        return result;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Submission timed out waiting for result');
  }

  /**
   * Process result and return our format
   */
  processResult(
    result: Judge0Result,
    expectedOutput: string,
    testCaseIndex: number
  ): {
    passed: boolean;
    status: SubmissionStatus;
    actualOutput?: string;
    expectedOutput: string;
    executionTime?: number;
    memoryUsed?: number;
    error?: string;
  } {
    const status = mapJudge0Status(result.status.id);
    const actualOutput = result.stdout?.trim() || '';
    const expected = expectedOutput.trim();
    const passed = status === 'accepted' && actualOutput === expected;

    return {
      passed: passed && status === 'accepted',
      status: passed ? 'accepted' : status === 'accepted' ? 'wrong-answer' : status,
      actualOutput,
      expectedOutput: expected,
      executionTime: result.time ? parseFloat(result.time) * 1000 : undefined,
      memoryUsed: result.memory || undefined,
      error: result.stderr || result.compile_output || result.message || undefined,
    };
  }

  /**
   * Simulate execution for when Judge0 is not configured
   * Returns mock results for development/testing
   */
  simulateExecution(
    code: string,
    language: string,
    testCases: Array<{ input: string; expectedOutput: string }>
  ): Array<{
    passed: boolean;
    status: SubmissionStatus;
    actualOutput: string;
    expectedOutput: string;
    executionTime: number;
    memoryUsed: number;
  }> {
    // Simple mock - just return passed for demo purposes
    // In real simulation, we could use a local sandbox
    return testCases.map((tc, index) => ({
      passed: true,
      status: 'accepted' as SubmissionStatus,
      actualOutput: tc.expectedOutput,
      expectedOutput: tc.expectedOutput,
      executionTime: Math.random() * 50 + 10,
      memoryUsed: Math.floor(Math.random() * 5000 + 10000),
    }));
  }
}

export const judge0Service = new Judge0Service();
