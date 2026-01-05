import { Concept } from '../types/problem';

export const ALL_CONCEPTS: Concept[] = [
  'arrays',
  'strings',
  'two-pointers',
  'sliding-window',
  'hashmaps',
  'sets',
  'stacks',
  'queues',
  'linked-lists',
  'trees',
  'binary-trees',
  'graphs',
  'bfs',
  'dfs',
  'dynamic-programming',
  'greedy',
  'recursion',
  'backtracking',
  'binary-search',
  'sorting',
  'heaps',
  'tries',
  'bit-manipulation',
];

export const FUNDAMENTAL_CONCEPTS: Concept[] = [
  'arrays',
  'strings',
  'hashmaps',
  'two-pointers',
];

export const CONCEPT_LABELS: Record<Concept, string> = {
  'arrays': 'Arrays',
  'strings': 'Strings',
  'two-pointers': 'Two Pointers',
  'sliding-window': 'Sliding Window',
  'hashmaps': 'Hash Maps',
  'sets': 'Sets',
  'stacks': 'Stacks',
  'queues': 'Queues',
  'linked-lists': 'Linked Lists',
  'trees': 'Trees',
  'binary-trees': 'Binary Trees',
  'graphs': 'Graphs',
  'bfs': 'BFS',
  'dfs': 'DFS',
  'dynamic-programming': 'Dynamic Programming',
  'greedy': 'Greedy',
  'recursion': 'Recursion',
  'backtracking': 'Backtracking',
  'binary-search': 'Binary Search',
  'sorting': 'Sorting',
  'heaps': 'Heaps',
  'tries': 'Tries',
  'bit-manipulation': 'Bit Manipulation',
};

export const LANGUAGE_IDS: Record<string, number> = {
  'python': 71,
  'python3': 71,
  'javascript': 63,
  'typescript': 74,
  'java': 62,
  'cpp': 54,
  'c': 50,
  'go': 60,
  'rust': 73,
};

export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python 3', judge0Id: 71 },
  { id: 'javascript', name: 'JavaScript', judge0Id: 63 },
  { id: 'typescript', name: 'TypeScript', judge0Id: 74 },
  { id: 'java', name: 'Java', judge0Id: 62 },
  { id: 'cpp', name: 'C++', judge0Id: 54 },
];
