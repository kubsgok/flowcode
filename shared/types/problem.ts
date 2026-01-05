export type Difficulty = 'easy' | 'medium' | 'hard';

export type Concept =
  | 'arrays'
  | 'strings'
  | 'two-pointers'
  | 'sliding-window'
  | 'hashmaps'
  | 'sets'
  | 'stacks'
  | 'queues'
  | 'linked-lists'
  | 'trees'
  | 'binary-trees'
  | 'graphs'
  | 'bfs'
  | 'dfs'
  | 'dynamic-programming'
  | 'greedy'
  | 'recursion'
  | 'backtracking'
  | 'binary-search'
  | 'sorting'
  | 'heaps'
  | 'tries'
  | 'bit-manipulation';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface Hint {
  level: 1 | 2 | 3;
  content: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  constraints: string[];
  examples: Example[];
  difficulty: Difficulty;
  difficultyScore: number;
  concepts: Concept[];
  secondaryConcepts?: Concept[];
  testCases: TestCase[];
  hints: Hint[];
  starterCode: Record<string, string>;
  solution?: Record<string, string>;
  solutionExplanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  successRate: number;
  averageTime: number;
  popularity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  concepts: Concept[];
  successRate: number;
  popularity: number;
}
