import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { config } from '../config/env';

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['arrays', 'hashmaps'],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: false },
      { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Think about what value you need to find for each element to reach the target. Can you check if that value exists efficiently?' },
      { level: 2, content: 'Use a hash map to store numbers you\'ve seen. For each number, check if (target - number) exists in the map.' },
      { level: 3, content: 'Iterate through the array once. For each element `num`, check if `target - num` is in your hash map. If yes, return both indices. If not, add `num` to the map with its index.' },
    ],
    starterCode: new Map([
      ['python', 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Your code here\n    pass'],
      ['javascript', 'function twoSum(nums, target) {\n    // Your code here\n}'],
      ['typescript', 'function twoSum(nums: number[], target: number): number[] {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass TwoSum {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}'],
      ['cpp', '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass TwoSum {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    successRate: 45,
    popularity: 100,
  },
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.',
    ],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' },
      { input: 's = " "', output: 'true', explanation: 'After removing non-alphanumeric characters, s is an empty string "".' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['strings', 'two-pointers'],
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
      { input: '"race a car"', expectedOutput: 'false', isHidden: false },
      { input: '" "', expectedOutput: 'true', isHidden: false },
      { input: '"Was it a car or a cat I saw?"', expectedOutput: 'true', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Consider using two pointers, one at the start and one at the end of the string.' },
      { level: 2, content: 'Skip non-alphanumeric characters and compare lowercase versions of the characters.' },
      { level: 3, content: 'Move left pointer right and right pointer left, skipping non-alphanumeric chars. Compare lowercase versions at each step.' },
    ],
    starterCode: new Map([
      ['python', 'def isPalindrome(s: str) -> bool:\n    # Your code here\n    pass'],
      ['javascript', 'function isPalindrome(s) {\n    // Your code here\n}'],
      ['typescript', 'function isPalindrome(s: string): boolean {\n    // Your code here\n}'],
      ['java', 'class IsPalindrome {\n    public boolean isPalindrome(String s) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '#include <string>\n#include <cctype>\nusing namespace std;\n\nclass IsPalindrome {\npublic:\n    bool isPalindrome(string s) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 50,
    popularity: 80,
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No transactions are done, max profit = 0.' },
    ],
    difficulty: 'easy',
    difficultyScore: 3,
    concepts: ['arrays', 'sliding-window'],
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
      { input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: false },
      { input: '[1,2]', expectedOutput: '1', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Track the minimum price seen so far as you iterate through the array.' },
      { level: 2, content: 'For each price, calculate potential profit if you sold at that price (current - minimum). Track the maximum.' },
      { level: 3, content: 'One pass: keep minPrice and maxProfit. For each price: update minPrice if lower, update maxProfit if (price - minPrice) is higher.' },
    ],
    starterCode: new Map([
      ['python', 'def maxProfit(prices: list[int]) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function maxProfit(prices) {\n    // Your code here\n}'],
      ['typescript', 'function maxProfit(prices: number[]): number {\n    // Your code here\n}'],
      ['java', 'class MaxProfit {\n    public int maxProfit(int[] prices) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass MaxProfit {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 48,
    popularity: 90,
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
      { input: 's = "([])"', output: 'true' },
    ],
    difficulty: 'easy',
    difficultyScore: 3,
    concepts: ['strings', 'stacks'],
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"([{}])"', expectedOutput: 'true', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use a stack data structure. Push opening brackets, pop when you see closing brackets.' },
      { level: 2, content: 'When you see a closing bracket, check if the top of the stack has the matching opening bracket.' },
      { level: 3, content: 'Push each opening bracket. For closing brackets, if stack is empty or top doesn\'t match, return false. Pop on match. At end, stack should be empty.' },
    ],
    starterCode: new Map([
      ['python', 'def isValid(s: str) -> bool:\n    # Your code here\n    pass'],
      ['javascript', 'function isValid(s) {\n    // Your code here\n}'],
      ['typescript', 'function isValid(s: string): boolean {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass IsValid {\n    public boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '#include <string>\n#include <stack>\nusing namespace std;\n\nclass IsValid {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    successRate: 42,
    popularity: 85,
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

**Note:** You may not slant the container.`,
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4',
    ],
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The max area is between index 1 and 8 with heights 8 and 7.' },
      { input: 'height = [1,1]', output: '1' },
    ],
    difficulty: 'medium',
    difficultyScore: 5,
    concepts: ['arrays', 'two-pointers'],
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isHidden: false },
      { input: '[1,1]', expectedOutput: '1', isHidden: false },
      { input: '[4,3,2,1,4]', expectedOutput: '16', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Start with two pointers at the ends of the array. The width is maximized here.' },
      { level: 2, content: 'Area = min(height[left], height[right]) * (right - left). Move the pointer with smaller height inward.' },
      { level: 3, content: 'Moving the smaller height pointer might find a taller line. Moving the taller one can only decrease area since width decreases and height is limited by the smaller.' },
    ],
    starterCode: new Map([
      ['python', 'def maxArea(height: list[int]) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function maxArea(height) {\n    // Your code here\n}'],
      ['typescript', 'function maxArea(height: number[]): number {\n    // Your code here\n}'],
      ['java', 'class MaxArea {\n    public int maxArea(int[] height) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass MaxArea {\npublic:\n    int maxArea(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 52,
    popularity: 75,
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with length 3.' },
    ],
    difficulty: 'medium',
    difficultyScore: 5,
    concepts: ['strings', 'sliding-window', 'hashmaps'],
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
      { input: '"pwwkew"', expectedOutput: '3', isHidden: false },
      { input: '""', expectedOutput: '0', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use a sliding window approach with two pointers.' },
      { level: 2, content: 'Use a set or map to track characters in the current window. Shrink window when a repeat is found.' },
      { level: 3, content: 'Expand right pointer adding chars to set. When duplicate found, shrink left pointer removing chars until no duplicate. Track max window size.' },
    ],
    starterCode: new Map([
      ['python', 'def lengthOfLongestSubstring(s: str) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function lengthOfLongestSubstring(s) {\n    // Your code here\n}'],
      ['typescript', 'function lengthOfLongestSubstring(s: string): number {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass LengthOfLongestSubstring {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <string>\n#include <unordered_set>\n#include <algorithm>\nusing namespace std;\n\nclass LengthOfLongestSubstring {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    successRate: 35,
    popularity: 95,
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    constraints: [
      '1 <= n <= 45',
    ],
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways: (1+1) and (2).' },
      { input: 'n = 3', output: '3', explanation: 'There are three ways: (1+1+1), (1+2), and (2+1).' },
    ],
    difficulty: 'easy',
    difficultyScore: 3,
    concepts: ['dynamic-programming', 'recursion'],
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: false },
      { input: '5', expectedOutput: '8', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'To reach step n, you can come from step n-1 or n-2.' },
      { level: 2, content: 'This follows the Fibonacci pattern: f(n) = f(n-1) + f(n-2).' },
      { level: 3, content: 'Use dynamic programming or simple iteration. Keep track of the previous two values and compute the next.' },
    ],
    starterCode: new Map([
      ['python', 'def climbStairs(n: int) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function climbStairs(n) {\n    // Your code here\n}'],
      ['typescript', 'function climbStairs(n: number): number {\n    // Your code here\n}'],
      ['java', 'class ClimbStairs {\n    public int climbStairs(int n) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', 'class ClimbStairs {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 55,
    popularity: 70,
  },
  {
    title: 'Binary Tree Level Order Traversal',
    slug: 'binary-tree-level-order-traversal',
    description: `Given the \`root\` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000',
    ],
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' },
    ],
    difficulty: 'medium',
    difficultyScore: 4,
    concepts: ['trees', 'bfs', 'queues'],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false },
      { input: '[1]', expectedOutput: '[[1]]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
    ],
    hints: [
      { level: 1, content: 'Use BFS (Breadth-First Search) with a queue.' },
      { level: 2, content: 'Process nodes level by level. Track the size of each level before processing.' },
      { level: 3, content: 'Start with root in queue. For each level: get queue size, process that many nodes, add their children. Append level values to result.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef levelOrder(root: TreeNode) -> list[list[int]]:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for a binary tree node.\nclass TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nfunction levelOrder(root) {\n    // Your code here\n}'],
      ['typescript', '// Definition for a binary tree node.\nclass TreeNode {\n    val: number;\n    left: TreeNode | null;\n    right: TreeNode | null;\n    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.left = (left === undefined ? null : left);\n        this.right = (right === undefined ? null : right);\n    }\n}\n\nfunction levelOrder(root: TreeNode | null): number[][] {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\n// Definition for a binary tree node.\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nclass LevelOrder {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}'],
      ['cpp', '#include <vector>\n#include <queue>\nusing namespace std;\n\n// Definition for a binary tree node.\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass LevelOrder {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Your code here\n        return {};\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    successRate: 58,
    popularity: 65,
  },
];

async function seedProblems() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    console.log('Clearing existing problems...');
    await Problem.deleteMany({});

    console.log('Seeding problems...');
    for (const problemData of problems) {
      const problem = new Problem(problemData);
      await problem.save();
      console.log(`  Created: ${problem.title}`);
    }

    console.log(`\nSuccessfully seeded ${problems.length} problems!`);
  } catch (error) {
    console.error('Error seeding problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedProblems();
