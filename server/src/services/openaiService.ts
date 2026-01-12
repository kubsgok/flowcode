import OpenAI from 'openai';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import type { TestCaseResult } from '@flowcode/shared';

interface AIHintParams {
  problemTitle: string;
  problemDescription: string;
  constraints: string[];
  userCode: string;
  language: string;
  executionResult: {
    status: string;
    testCaseResults: TestCaseResult[];
    passedTestCases: number;
    totalTestCases: number;
    error?: string;
  };
}

interface AIHintResponse {
  hint: string;
  tokensUsed: number;
}

class OpenAIService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!config.openai.apiKey) {
      throw new AppError('OpenAI API key not configured', 503);
    }

    if (!this.client) {
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }

    return this.client;
  }

  private buildSystemPrompt(): string {
    return `You are an expert programming tutor helping a student solve a coding problem. Your role is to provide a helpful, personalized hint based on their current code and test results.

Guidelines:
1. DO NOT provide the complete solution or working code
2. Focus on the specific issue in their code
3. Guide them toward the solution with questions and small nudges
4. If they have compilation/runtime errors, explain the error clearly
5. If tests are failing, hint at the logical issue without giving away the fix
6. Be encouraging and supportive
7. Keep hints concise (2-4 sentences max)
8. Use markdown formatting for code snippets if needed
9. If their approach is fundamentally wrong, gently suggest reconsidering their strategy`;
  }

  private buildUserPrompt(params: AIHintParams): string {
    const { problemTitle, problemDescription, constraints, userCode, language, executionResult } = params;

    // Format failed test cases (only include visible ones with details)
    const failedTests = executionResult.testCaseResults
      .filter(tc => !tc.passed && tc.input !== undefined)
      .slice(0, 3) // Limit to 3 failed tests to save tokens
      .map((tc, idx) => {
        let testInfo = `Test ${idx + 1}:\n  Input: ${tc.input}`;
        if (tc.expectedOutput !== undefined) {
          testInfo += `\n  Expected: ${tc.expectedOutput}`;
        }
        if (tc.actualOutput !== undefined) {
          testInfo += `\n  Got: ${tc.actualOutput || '(no output)'}`;
        }
        if (tc.error) {
          testInfo += `\n  Error: ${tc.error}`;
        }
        return testInfo;
      })
      .join('\n\n');

    let prompt = `Problem: ${problemTitle}

Description:
${problemDescription}

${constraints.length > 0 ? `Constraints:\n${constraints.map(c => `- ${c}`).join('\n')}\n` : ''}
Student's Code (${language}):
\`\`\`${language}
${userCode}
\`\`\`

Execution Results:
- Status: ${executionResult.status}
- Passed: ${executionResult.passedTestCases}/${executionResult.totalTestCases} tests`;

    if (executionResult.error) {
      prompt += `\n- Error: ${executionResult.error}`;
    }

    if (failedTests) {
      prompt += `\n\nFailed Test Cases:\n${failedTests}`;
    }

    prompt += '\n\nProvide a helpful hint to guide the student without giving away the solution.';

    return prompt;
  }

  async generateHint(params: AIHintParams): Promise<AIHintResponse> {
    const client = this.getClient();

    try {
      const response = await client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: this.buildUserPrompt(params) },
        ],
        max_tokens: config.openai.maxTokens,
        temperature: 0.7,
      });

      const hint = response.choices[0]?.message?.content;

      if (!hint) {
        throw new AppError('Failed to generate hint', 500);
      }

      return {
        hint,
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new AppError('AI service rate limit exceeded. Please try again later.', 429);
        }
        if (error.status === 401) {
          throw new AppError('AI service authentication failed', 503);
        }
        if (error.status === 503) {
          throw new AppError('AI service temporarily unavailable', 503);
        }
      }

      console.error('OpenAI API error:', error);
      throw new AppError('Failed to generate AI hint. Please try again.', 500);
    }
  }
}

export const openaiService = new OpenAIService();
