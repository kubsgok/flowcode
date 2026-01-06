import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { problemApi } from '../api/problemApi';
import { submissionApi } from '../api/submissionApi';
import { challengeApi } from '../api/challengeApi';
import { SplitPane } from '../components/layout/SplitPane';
import { Spinner } from '../components/common/Spinner';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import {
  Code2,
  Play,
  Send,
  Lightbulb,
  ChevronRight,
  Lock,
  Unlock,
  ArrowLeft,
  RotateCcw,
  Settings,
  CheckCircle,
  XCircle,
  Target,
  Flame,
} from 'lucide-react';
import type { Problem, TestCaseResult } from '@flowcode/shared';
import { SUPPORTED_LANGUAGES } from '@flowcode/shared';

export function PracticePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is in guided mode
  const isGuidedUser = user?.preferredMode === 'guided';

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [newStreak, setNewStreak] = useState<number | null>(null);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(
    user?.preferences?.preferredLanguage || 'python'
  );
  const [activeTab, setActiveTab] = useState<'description' | 'hints'>('description');
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);
  const [hintContents, setHintContents] = useState<Record<number, string>>({});
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [_testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showBackMenu, setShowBackMenu] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const fetchProblem = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError('');

      try {
        const data = await problemApi.getProblemBySlug(slug);
        setProblem(data);

        // Set starter code
        const starterCode =
          data.starterCode instanceof Map
            ? data.starterCode.get(language)
            : (data.starterCode as Record<string, string>)?.[language];

        setCode(starterCode || getDefaultCode(language));
      } catch (err) {
        setError('Problem not found');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (!problem) return;

    // Load saved code from localStorage
    const savedCode = localStorage.getItem(`code-${problem.id}-${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      const starterCode =
        problem.starterCode instanceof Map
          ? problem.starterCode.get(language)
          : (problem.starterCode as Record<string, string>)?.[language];

      setCode(starterCode || getDefaultCode(language));
    }
  }, [language, problem]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);

    // Save to localStorage
    if (problem) {
      localStorage.setItem(`code-${problem.id}-${language}`, newCode);
    }
  };

  const handleResetCode = () => {
    if (!problem) return;

    const starterCode =
      problem.starterCode instanceof Map
        ? problem.starterCode.get(language)
        : (problem.starterCode as Record<string, string>)?.[language];

    setCode(starterCode || getDefaultCode(language));
    localStorage.removeItem(`code-${problem.id}-${language}`);
  };

  const handleUnlockHint = async (level: 1 | 2 | 3) => {
    if (!problem || unlockedHints.includes(level)) return;

    setIsLoadingHint(true);
    try {
      const { hint } = await problemApi.getHint(problem.id, level);
      setUnlockedHints([...unlockedHints, level]);
      setHintContents({ ...hintContents, [level]: hint });
    } catch (err) {
      console.error('Failed to unlock hint:', err);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleRun = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput('Running tests...\n');
    setTestResults([]);
    setExecutionStatus('idle');

    try {
      const result = await submissionApi.runCode({
        problemId: problem.id,
        code,
        language,
      });

      setTestResults(result.testCaseResults);
      setExecutionStatus(result.status === 'accepted' ? 'success' : 'error');

      // Format output
      let outputText = `Status: ${result.status.toUpperCase()}\n`;
      outputText += `Passed: ${result.passedTestCases}/${result.totalTestCases} test cases\n`;
      outputText += `Time: ${result.executionTime.toFixed(2)}ms\n\n`;

      result.testCaseResults.forEach((tc, idx) => {
        const icon = tc.passed ? '✓' : '✗';
        outputText += `Test ${idx + 1}: ${icon} ${tc.passed ? 'Passed' : 'Failed'}\n`;
        if (tc.input) {
          outputText += `  Input: ${tc.input}\n`;
        }
        if (!tc.passed) {
          if (tc.expectedOutput !== undefined) {
            outputText += `  Expected: ${tc.expectedOutput}\n`;
          }
          if (tc.actualOutput !== undefined) {
            outputText += `  Got: ${tc.actualOutput || '(empty)'}\n`;
          }
        }
        if (tc.error) {
          outputText += `  Error: ${tc.error}\n`;
        }
        outputText += '\n';
      });

      setOutput(outputText);
    } catch (err) {
      console.error('Run failed:', err);
      setOutput('Error running code. Please try again.');
      setExecutionStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    setIsSubmitting(true);
    setOutput('Submitting solution...\n');
    setTestResults([]);
    setExecutionStatus('idle');

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const result = await submissionApi.submitCode({
        problemId: problem.id,
        code,
        language,
        timeSpent,
        hintsUsed: unlockedHints,
      });

      setTestResults(result.testCaseResults);
      setExecutionStatus(result.status === 'accepted' ? 'success' : 'error');

      // If accepted and user is in guided mode, complete the challenge
      if (result.status === 'accepted' && isGuidedUser && problem) {
        try {
          const streakInfo = await challengeApi.completeChallenge(problem.id);
          setStreakUpdated(true);
          setNewStreak(streakInfo.currentStreak);
        } catch (err) {
          console.error('Failed to update streak:', err);
        }
      }

      // Format output
      let outputText = '';
      if (result.status === 'accepted') {
        outputText = `🎉 ACCEPTED!\n\n`;
      } else {
        outputText = `❌ ${result.status.toUpperCase()}\n\n`;
      }

      outputText += `Passed: ${result.passedTestCases}/${result.totalTestCases} test cases\n`;
      outputText += `Time: ${result.executionTime.toFixed(2)}ms\n`;
      outputText += `Memory: ${(result.memoryUsed / 1024).toFixed(2)} MB\n\n`;

      result.testCaseResults.forEach((tc, idx) => {
        const icon = tc.passed ? '✓' : '✗';
        outputText += `Test ${idx + 1}: ${icon} ${tc.passed ? 'Passed' : 'Failed'}\n`;
        if (tc.input) {
          outputText += `  Input: ${tc.input}\n`;
        }
        if (!tc.passed) {
          if (tc.expectedOutput !== undefined) {
            outputText += `  Expected: ${tc.expectedOutput}\n`;
          }
          if (tc.actualOutput !== undefined) {
            outputText += `  Got: ${tc.actualOutput || '(empty)'}\n`;
          }
        }
        if (tc.error) {
          outputText += `  Error: ${tc.error}\n`;
        }
        outputText += '\n';
      });

      setOutput(outputText);
    } catch (err) {
      console.error('Submit failed:', err);
      setOutput('Error submitting code. Please try again.');
      setExecutionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'Problem not found'}
          </h1>
          <Link to="/problems" className="btn btn-primary">
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Streak Update Banner */}
      {streakUpdated && newStreak !== null && (
        <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-b border-orange-500/30 px-4 py-3 flex items-center justify-center gap-3">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-white font-medium">
            {newStreak === 1
              ? 'Streak started! Keep it up tomorrow!'
              : `${newStreak} day streak! 🔥`}
          </span>
          <button
            onClick={() => navigate('/guided')}
            className="ml-4 btn btn-sm bg-orange-500 hover:bg-orange-600 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Header */}
      <header className="h-14 border-b border-slate-800 flex items-center px-4 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowBackMenu(!showBackMenu)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <Code2 className="w-5 h-5 text-primary-500" />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>

          {showBackMenu && (
            <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
              <button
                onClick={() => {
                  navigate('/guided');
                  setShowBackMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-primary-500" />
                Guided Mode
              </button>
              <button
                onClick={() => {
                  navigate('/problems');
                  setShowBackMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
              >
                <Code2 className="w-4 h-4 text-primary-500" />
                All Problems
              </button>
            </div>
          )}
        </div>

        <h1 className="text-white font-medium flex-1 truncate">{problem.title}</h1>

        <span className={`badge badge-${problem.difficulty} mr-4`}>
          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <SplitPane
          leftPanel={
            <LeftPanel
              problem={problem}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              unlockedHints={unlockedHints}
              hintContents={hintContents}
              onUnlockHint={handleUnlockHint}
              isLoadingHint={isLoadingHint}
            />
          }
          rightPanel={
            <RightPanel
              code={code}
              language={language}
              setLanguage={setLanguage}
              onCodeChange={handleCodeChange}
              onResetCode={handleResetCode}
              onRun={handleRun}
              onSubmit={handleSubmit}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              output={output}
              executionStatus={executionStatus}
            />
          }
        />
      </div>
    </div>
  );
}

// Left Panel Component
function LeftPanel({
  problem,
  activeTab,
  setActiveTab,
  unlockedHints,
  hintContents,
  onUnlockHint,
  isLoadingHint,
}: {
  problem: Problem;
  activeTab: 'description' | 'hints';
  setActiveTab: (tab: 'description' | 'hints') => void;
  unlockedHints: number[];
  hintContents: Record<number, string>;
  onUnlockHint: (level: 1 | 2 | 3) => void;
  isLoadingHint: boolean;
}) {
  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('description')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'description'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'hints'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Hints
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'description' ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{problem.description}</ReactMarkdown>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Examples</h3>
                {problem.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 rounded-lg p-4 mb-3 font-mono text-sm"
                  >
                    <div className="text-slate-400 mb-1">
                      <span className="text-slate-500">Input:</span>{' '}
                      <span className="text-white">{example.input}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Output:</span>{' '}
                      <span className="text-white">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div className="text-slate-400 mt-2 text-xs">
                        <span className="text-slate-500">Explanation:</span>{' '}
                        {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Constraints
                </h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {problem.constraints.map((constraint, idx) => (
                    <li key={idx} className="font-mono text-sm">
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3].map((level) => (
              <HintCard
                key={level}
                level={level as 1 | 2 | 3}
                isUnlocked={unlockedHints.includes(level)}
                content={hintContents[level]}
                onUnlock={() => onUnlockHint(level as 1 | 2 | 3)}
                isLoading={isLoadingHint}
                canUnlock={level === 1 || unlockedHints.includes(level - 1)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Hint Card Component
function HintCard({
  level,
  isUnlocked,
  content,
  onUnlock,
  isLoading,
  canUnlock,
}: {
  level: 1 | 2 | 3;
  isUnlocked: boolean;
  content?: string;
  onUnlock: () => void;
  isLoading: boolean;
  canUnlock: boolean;
}) {
  const labels = {
    1: 'Approach',
    2: 'Algorithm',
    3: 'Solution Walkthrough',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <Unlock className="w-4 h-4 text-success-500" />
          ) : (
            <Lock className="w-4 h-4 text-slate-500" />
          )}
          <span className="font-medium text-white">
            Hint {level}: {labels[level]}
          </span>
        </div>
      </div>

      {isUnlocked ? (
        <div className="text-slate-300 text-sm">
          <ReactMarkdown>{content || 'Loading...'}</ReactMarkdown>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 text-sm mb-3">
            {canUnlock
              ? 'Click to reveal this hint. Using hints may affect your skill score.'
              : 'Unlock the previous hint first.'}
          </p>
          <button
            onClick={onUnlock}
            disabled={!canUnlock || isLoading}
            className="btn btn-secondary text-sm"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Unlocking...
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 mr-1" />
                Reveal Hint
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Right Panel Component
function RightPanel({
  code,
  language,
  setLanguage,
  onCodeChange,
  onResetCode,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  output,
  executionStatus,
}: {
  code: string;
  language: string;
  setLanguage: (lang: string) => void;
  onCodeChange: (value: string | undefined) => void;
  onResetCode: () => void;
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  output: string;
  executionStatus: 'idle' | 'success' | 'error';
}) {
  const [bottomPanelHeight] = useState(200);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Editor Toolbar */}
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={onResetCode}
            className="text-slate-400 hover:text-white p-1"
            title="Reset to starter code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button className="text-slate-400 hover:text-white p-1" title="Settings">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Code Editor */}
      <div
        className="flex-1 min-h-0"
        style={{ height: `calc(100% - 48px - ${bottomPanelHeight}px)` }}
      >
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Bottom Panel */}
      <div
        className="border-t border-slate-700 flex flex-col"
        style={{ height: bottomPanelHeight }}
      >
        {/* Output Header */}
        <div className="h-10 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Output</span>
            {executionStatus === 'success' && (
              <CheckCircle className="w-4 h-4 text-success-500" />
            )}
            {executionStatus === 'error' && (
              <XCircle className="w-4 h-4 text-error-500" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRun}
              disabled={isRunning || isSubmitting}
              className="btn btn-secondary text-sm py-1"
            >
              {isRunning ? (
                <>
                  <Spinner size="sm" className="mr-1" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </>
              )}
            </button>
            <button
              onClick={onSubmit}
              disabled={isRunning || isSubmitting}
              className="btn btn-success text-sm py-1"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-1" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Content */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-slate-300 bg-slate-950">
          {output ? (
            <pre className="whitespace-pre-wrap">{output}</pre>
          ) : (
            <span className="text-slate-500">
              Click "Run" to test your code against visible test cases
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getMonacoLanguage(language: string): string {
  const map: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    typescript: 'typescript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rust',
  };
  return map[language] || 'plaintext';
}

function getDefaultCode(language: string): string {
  const templates: Record<string, string> = {
    python: `def solution():\n    # Write your solution here\n    pass\n`,
    javascript: `function solution() {\n  // Write your solution here\n}\n`,
    typescript: `function solution(): void {\n  // Write your solution here\n}\n`,
    java: `class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}\n`,
    cpp: `class Solution {\npublic:\n    void solution() {\n        // Write your solution here\n    }\n};\n`,
  };
  return templates[language] || '// Write your solution here\n';
}
