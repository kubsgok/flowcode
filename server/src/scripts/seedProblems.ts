import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { config } from '../config/env';

const problems = [
  // ============================================
  // ARRAYS (6 problems: 2 easy, 2 medium, 2 hard)
  // ============================================
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
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['arrays', 'hashmaps'],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Think about what value you need to find for each element to reach the target.' },
      { level: 2, content: 'Use a hash map to store numbers you\'ve seen.' },
      { level: 3, content: 'For each element, check if (target - num) exists in your map. If yes, return indices.' },
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
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No profitable transaction possible.' },
    ],
    difficulty: 'easy',
    difficultyScore: 3,
    concepts: ['arrays'],
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
      { input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: false },
      { input: '[1,2]', expectedOutput: '1', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Track the minimum price seen so far.' },
      { level: 2, content: 'For each price, calculate profit if sold today (current - minimum).' },
      { level: 3, content: 'One pass: track minPrice and maxProfit. Update both as you iterate.' },
    ],
    starterCode: new Map([
      ['python', 'def maxProfit(prices: list[int]) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function maxProfit(prices) {\n    // Your code here\n}'],
      ['typescript', 'function maxProfit(prices: number[]): number {\n    // Your code here\n}'],
      ['java', 'class MaxProfit {\n    public int maxProfit(int[] prices) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\nusing namespace std;\n\nclass MaxProfit {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 48,
    popularity: 90,
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4',
    ],
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The max area is between index 1 and 8.' },
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
      { level: 1, content: 'Use two pointers at the ends of the array.' },
      { level: 2, content: 'Area = min(height[left], height[right]) * (right - left).' },
      { level: 3, content: 'Move the pointer with smaller height inward to potentially find larger area.' },
    ],
    starterCode: new Map([
      ['python', 'def maxArea(height: list[int]) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function maxArea(height) {\n    // Your code here\n}'],
      ['typescript', 'function maxArea(height: number[]): number {\n    // Your code here\n}'],
      ['java', 'class MaxArea {\n    public int maxArea(int[] height) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\nusing namespace std;\n\nclass MaxArea {\npublic:\n    int maxArea(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 52,
    popularity: 75,
  },
  {
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a **32-bit** integer.

You must write an algorithm that runs in O(n) time and **without using the division operation**.`,
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'The product of any prefix or suffix fits in a 32-bit integer.',
    ],
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
    ],
    difficulty: 'medium',
    difficultyScore: 5,
    concepts: ['arrays'],
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isHidden: false },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]', isHidden: false },
      { input: '[2,3]', expectedOutput: '[3,2]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Think about prefix and suffix products.' },
      { level: 2, content: 'For each position, you need product of all elements to the left AND all elements to the right.' },
      { level: 3, content: 'First pass: compute prefix products. Second pass: multiply by suffix products from right to left.' },
    ],
    starterCode: new Map([
      ['python', 'def productExceptSelf(nums: list[int]) -> list[int]:\n    # Your code here\n    pass'],
      ['javascript', 'function productExceptSelf(nums) {\n    // Your code here\n}'],
      ['typescript', 'function productExceptSelf(nums: number[]): number[] {\n    // Your code here\n}'],
      ['java', 'class ProductExceptSelf {\n    public int[] productExceptSelf(int[] nums) {\n        // Your code here\n        return new int[]{};\n    }\n}'],
      ['cpp', '#include <vector>\nusing namespace std;\n\nclass ProductExceptSelf {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Your code here\n        return {};\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 40,
    popularity: 80,
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    difficulty: 'hard',
    difficultyScore: 6,
    concepts: ['arrays', 'dynamic-programming'],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[1]', expectedOutput: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Consider Kadane\'s algorithm.' },
      { level: 2, content: 'At each position, decide: start fresh or extend previous subarray?' },
      { level: 3, content: 'Track currentMax (max ending here) and globalMax. currentMax = max(num, currentMax + num).' },
    ],
    starterCode: new Map([
      ['python', 'def maxSubArray(nums: list[int]) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function maxSubArray(nums) {\n    // Your code here\n}'],
      ['typescript', 'function maxSubArray(nums: number[]): number {\n    // Your code here\n}'],
      ['java', 'class MaxSubArray {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\nusing namespace std;\n\nclass MaxSubArray {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 35,
    popularity: 85,
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
    ],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    difficulty: 'hard',
    difficultyScore: 8,
    concepts: ['arrays', 'two-pointers'],
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
      { input: '[1,0,1]', expectedOutput: '1', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Water at each position = min(maxLeft, maxRight) - height[i].' },
      { level: 2, content: 'You can precompute maxLeft and maxRight arrays.' },
      { level: 3, content: 'Or use two pointers: process from both ends, moving the pointer with smaller max height.' },
    ],
    starterCode: new Map([
      ['python', 'def trap(height: list[int]) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function trap(height) {\n    // Your code here\n}'],
      ['typescript', 'function trap(height: number[]): number {\n    // Your code here\n}'],
      ['java', 'class Trap {\n    public int trap(int[] height) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\nusing namespace std;\n\nclass Trap {\npublic:\n    int trap(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 25,
    popularity: 90,
  },

  // ============================================
  // STRINGS (6 problems: 2 easy, 2 medium, 2 hard)
  // ============================================
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
      { input: 's = "race a car"', output: 'false' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['strings', 'two-pointers'],
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
      { input: '"race a car"', expectedOutput: 'false', isHidden: false },
      { input: '" "', expectedOutput: 'true', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use two pointers at the start and end.' },
      { level: 2, content: 'Skip non-alphanumeric characters.' },
      { level: 3, content: 'Compare lowercase versions of characters at each pointer.' },
    ],
    starterCode: new Map([
      ['python', 'def isPalindrome(s: str) -> bool:\n    # Your code here\n    pass'],
      ['javascript', 'function isPalindrome(s) {\n    // Your code here\n}'],
      ['typescript', 'function isPalindrome(s: string): boolean {\n    // Your code here\n}'],
      ['java', 'class IsPalindrome {\n    public boolean isPalindrome(String s) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '#include <string>\nusing namespace std;\n\nclass IsPalindrome {\npublic:\n    bool isPalindrome(string s) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 50,
    popularity: 80,
  },
  {
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.`,
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.',
    ],
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['strings', 'hashmaps'],
    testCases: [
      { input: '"anagram"\n"nagaram"', expectedOutput: 'true', isHidden: false },
      { input: '"rat"\n"car"', expectedOutput: 'false', isHidden: false },
      { input: '"a"\n"ab"', expectedOutput: 'false', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'What defines an anagram? Same characters, same counts.' },
      { level: 2, content: 'Count the frequency of each character in both strings.' },
      { level: 3, content: 'Use a hash map or array of 26 elements to count characters.' },
    ],
    starterCode: new Map([
      ['python', 'def isAnagram(s: str, t: str) -> bool:\n    # Your code here\n    pass'],
      ['javascript', 'function isAnagram(s, t) {\n    // Your code here\n}'],
      ['typescript', 'function isAnagram(s: string, t: string): boolean {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass IsAnagram {\n    public boolean isAnagram(String s, String t) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass IsAnagram {\npublic:\n    bool isAnagram(string s, string t) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 55,
    popularity: 70,
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
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' },
    ],
    difficulty: 'medium',
    difficultyScore: 5,
    concepts: ['strings', 'sliding-window', 'hashmaps'],
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
      { input: '"pwwkew"', expectedOutput: '3', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use a sliding window approach.' },
      { level: 2, content: 'Track characters in current window with a set or map.' },
      { level: 3, content: 'Expand right, shrink left when duplicate found, track max length.' },
    ],
    starterCode: new Map([
      ['python', 'def lengthOfLongestSubstring(s: str) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function lengthOfLongestSubstring(s) {\n    // Your code here\n}'],
      ['typescript', 'function lengthOfLongestSubstring(s: string): number {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass LengthOfLongestSubstring {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <string>\n#include <unordered_set>\nusing namespace std;\n\nclass LengthOfLongestSubstring {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    successRate: 35,
    popularity: 95,
  },
  {
    title: 'String to Integer (atoi)',
    slug: 'string-to-integer-atoi',
    description: `Implement the \`myAtoi(string s)\` function, which converts a string to a 32-bit signed integer.

The algorithm:
1. Read and ignore leading whitespace.
2. Check for '+' or '-' sign (default positive).
3. Read digits until non-digit or end of string.
4. Convert digits to integer.
5. Clamp to 32-bit signed integer range [-2^31, 2^31 - 1].`,
    constraints: [
      '0 <= s.length <= 200',
      's consists of English letters, digits, \' \', \'+\', \'-\', and \'.\'.',
    ],
    examples: [
      { input: 's = "42"', output: '42' },
      { input: 's = "   -42"', output: '-42' },
      { input: 's = "4193 with words"', output: '4193' },
    ],
    difficulty: 'medium',
    difficultyScore: 5,
    concepts: ['strings'],
    testCases: [
      { input: '"42"', expectedOutput: '42', isHidden: false },
      { input: '"   -42"', expectedOutput: '-42', isHidden: false },
      { input: '"4193 with words"', expectedOutput: '4193', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Handle whitespace, sign, and digits separately.' },
      { level: 2, content: 'Watch for overflow - check before adding each digit.' },
      { level: 3, content: 'Use long or check overflow condition: result > (MAX - digit) / 10.' },
    ],
    starterCode: new Map([
      ['python', 'def myAtoi(s: str) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function myAtoi(s) {\n    // Your code here\n}'],
      ['typescript', 'function myAtoi(s: string): number {\n    // Your code here\n}'],
      ['java', 'class MyAtoi {\n    public int myAtoi(String s) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <string>\nusing namespace std;\n\nclass MyAtoi {\npublic:\n    int myAtoi(string s) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 30,
    popularity: 60,
  },
  {
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    description: `Given a string \`s\`, return the longest palindromic substring in \`s\`.`,
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.',
    ],
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    difficulty: 'hard',
    difficultyScore: 6,
    concepts: ['strings', 'dynamic-programming'],
    testCases: [
      { input: '"babad"', expectedOutput: 'bab', isHidden: false },
      { input: '"cbbd"', expectedOutput: 'bb', isHidden: false },
      { input: '"a"', expectedOutput: 'a', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Expand around center approach works well.' },
      { level: 2, content: 'For each position, try expanding as both odd and even length palindrome.' },
      { level: 3, content: 'For each center, expand while characters match. Track the longest found.' },
    ],
    starterCode: new Map([
      ['python', 'def longestPalindrome(s: str) -> str:\n    # Your code here\n    pass'],
      ['javascript', 'function longestPalindrome(s) {\n    // Your code here\n}'],
      ['typescript', 'function longestPalindrome(s: string): string {\n    // Your code here\n}'],
      ['java', 'class LongestPalindrome {\n    public String longestPalindrome(String s) {\n        // Your code here\n        return "";\n    }\n}'],
      ['cpp', '#include <string>\nusing namespace std;\n\nclass LongestPalindrome {\npublic:\n    string longestPalindrome(string s) {\n        // Your code here\n        return "";\n    }\n};'],
    ]),
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    successRate: 28,
    popularity: 85,
  },
  {
    title: 'Minimum Window Substring',
    slug: 'minimum-window-substring',
    description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included in the window. If there is no such substring, return empty string \`""\`.`,
    constraints: [
      'm == s.length',
      'n == t.length',
      '1 <= m, n <= 10^5',
      's and t consist of uppercase and lowercase English letters.',
    ],
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'The minimum window substring containing A, B, C is "BANC".' },
      { input: 's = "a", t = "a"', output: '"a"' },
    ],
    difficulty: 'hard',
    difficultyScore: 8,
    concepts: ['strings', 'sliding-window', 'hashmaps'],
    testCases: [
      { input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: 'BANC', isHidden: false },
      { input: '"a"\n"a"', expectedOutput: 'a', isHidden: false },
      { input: '"ab"\n"a"', expectedOutput: 'a', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use sliding window with two pointers.' },
      { level: 2, content: 'Expand right to include all chars, then shrink left to minimize.' },
      { level: 3, content: 'Track character counts. Window is valid when all t\'s chars are covered.' },
    ],
    starterCode: new Map([
      ['python', 'def minWindow(s: str, t: str) -> str:\n    # Your code here\n    pass'],
      ['javascript', 'function minWindow(s, t) {\n    // Your code here\n}'],
      ['typescript', 'function minWindow(s: string, t: string): string {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass MinWindow {\n    public String minWindow(String s, String t) {\n        // Your code here\n        return "";\n    }\n}'],
      ['cpp', '#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass MinWindow {\npublic:\n    string minWindow(string s, string t) {\n        // Your code here\n        return "";\n    }\n};'],
    ]),
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(m + n)',
    successRate: 20,
    popularity: 80,
  },

  // ============================================
  // HASHMAPS (6 problems: 2 easy, 2 medium, 2 hard)
  // ============================================
  {
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
    ],
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    difficulty: 'easy',
    difficultyScore: 1,
    concepts: ['hashmaps', 'arrays'],
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true', isHidden: false },
      { input: '[1,2,3,4]', expectedOutput: 'false', isHidden: false },
      { input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'What data structure helps check if an element exists quickly?' },
      { level: 2, content: 'Use a HashSet to track seen elements.' },
      { level: 3, content: 'For each element, check if in set (return true), else add to set.' },
    ],
    starterCode: new Map([
      ['python', 'def containsDuplicate(nums: list[int]) -> bool:\n    # Your code here\n    pass'],
      ['javascript', 'function containsDuplicate(nums) {\n    // Your code here\n}'],
      ['typescript', 'function containsDuplicate(nums: number[]): boolean {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass ContainsDuplicate {\n    public boolean containsDuplicate(int[] nums) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nclass ContainsDuplicate {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    successRate: 60,
    popularity: 65,
  },
  {
    title: 'Ransom Note',
    slug: 'ransom-note',
    description: `Given two strings \`ransomNote\` and \`magazine\`, return \`true\` if \`ransomNote\` can be constructed by using the letters from \`magazine\` and \`false\` otherwise.

Each letter in \`magazine\` can only be used once in \`ransomNote\`.`,
    constraints: [
      '1 <= ransomNote.length, magazine.length <= 10^5',
      'ransomNote and magazine consist of lowercase English letters.',
    ],
    examples: [
      { input: 'ransomNote = "a", magazine = "b"', output: 'false' },
      { input: 'ransomNote = "aa", magazine = "aab"', output: 'true' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['hashmaps', 'strings'],
    testCases: [
      { input: '"a"\n"b"', expectedOutput: 'false', isHidden: false },
      { input: '"aa"\n"aab"', expectedOutput: 'true', isHidden: false },
      { input: '"aab"\n"baa"', expectedOutput: 'true', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Count available letters in magazine.' },
      { level: 2, content: 'Check if each letter needed for ransom note is available.' },
      { level: 3, content: 'Use a frequency map. Decrement counts as you use letters.' },
    ],
    starterCode: new Map([
      ['python', 'def canConstruct(ransomNote: str, magazine: str) -> bool:\n    # Your code here\n    pass'],
      ['javascript', 'function canConstruct(ransomNote, magazine) {\n    // Your code here\n}'],
      ['typescript', 'function canConstruct(ransomNote: string, magazine: string): boolean {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass CanConstruct {\n    public boolean canConstruct(String ransomNote, String magazine) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass CanConstruct {\npublic:\n    bool canConstruct(string ransomNote, string magazine) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(1)',
    successRate: 55,
    popularity: 50,
  },
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in **any order**.

An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.`,
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.',
    ],
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
    ],
    difficulty: 'medium',
    difficultyScore: 4,
    concepts: ['hashmaps', 'strings'],
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', isHidden: false },
      { input: '[""]', expectedOutput: '[[""]]', isHidden: false },
      { input: '["a"]', expectedOutput: '[["a"]]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Anagrams have the same characters when sorted.' },
      { level: 2, content: 'Use sorted string as a key in a hash map.' },
      { level: 3, content: 'Group words by their sorted form. Return all groups.' },
    ],
    starterCode: new Map([
      ['python', 'def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    # Your code here\n    pass'],
      ['javascript', 'function groupAnagrams(strs) {\n    // Your code here\n}'],
      ['typescript', 'function groupAnagrams(strs: string[]): string[][] {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass GroupAnagrams {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}'],
      ['cpp', '#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass GroupAnagrams {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Your code here\n        return {};\n    }\n};'],
    ]),
    timeComplexity: 'O(n * k log k)',
    spaceComplexity: 'O(n * k)',
    successRate: 45,
    popularity: 75,
  },
  {
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in **any order**.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      'k is in the range [1, the number of unique elements].',
      'The answer is guaranteed to be unique.',
    ],
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    difficulty: 'medium',
    difficultyScore: 5,
    concepts: ['hashmaps', 'heaps'],
    testCases: [
      { input: '[1,1,1,2,2,3]\n2', expectedOutput: '[1,2]', isHidden: false },
      { input: '[1]\n1', expectedOutput: '[1]', isHidden: false },
      { input: '[4,1,-1,2,-1,2,3]\n2', expectedOutput: '[-1,2]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'First count frequencies using a hash map.' },
      { level: 2, content: 'Then find the k highest frequencies.' },
      { level: 3, content: 'Use a min-heap of size k, or bucket sort by frequency.' },
    ],
    starterCode: new Map([
      ['python', 'def topKFrequent(nums: list[int], k: int) -> list[int]:\n    # Your code here\n    pass'],
      ['javascript', 'function topKFrequent(nums, k) {\n    // Your code here\n}'],
      ['typescript', 'function topKFrequent(nums: number[], k: number): number[] {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass TopKFrequent {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Your code here\n        return new int[]{};\n    }\n}'],
      ['cpp', '#include <vector>\n#include <unordered_map>\n#include <queue>\nusing namespace std;\n\nclass TopKFrequent {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        // Your code here\n        return {};\n    }\n};'],
    ]),
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(n)',
    successRate: 40,
    popularity: 70,
  },
  {
    title: 'Longest Consecutive Sequence',
    slug: 'longest-consecutive-sequence',
    description: `Given an unsorted array of integers \`nums\`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in **O(n)** time.`,
    constraints: [
      '0 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
    ],
    examples: [
      { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive sequence is [1, 2, 3, 4].' },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' },
    ],
    difficulty: 'hard',
    difficultyScore: 6,
    concepts: ['hashmaps', 'arrays'],
    testCases: [
      { input: '[100,4,200,1,3,2]', expectedOutput: '4', isHidden: false },
      { input: '[0,3,7,2,5,8,4,6,0,1]', expectedOutput: '9', isHidden: false },
      { input: '[]', expectedOutput: '0', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use a HashSet for O(1) lookups.' },
      { level: 2, content: 'Only start counting from numbers that are sequence starts (n-1 not in set).' },
      { level: 3, content: 'For each sequence start, count consecutive numbers using the set.' },
    ],
    starterCode: new Map([
      ['python', 'def longestConsecutive(nums: list[int]) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function longestConsecutive(nums) {\n    // Your code here\n}'],
      ['typescript', 'function longestConsecutive(nums: number[]): number {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass LongestConsecutive {\n    public int longestConsecutive(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nclass LongestConsecutive {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    successRate: 30,
    popularity: 75,
  },
  {
    title: 'Subarray Sum Equals K',
    slug: 'subarray-sum-equals-k',
    description: `Given an array of integers \`nums\` and an integer \`k\`, return the total number of subarrays whose sum equals to \`k\`.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 2 * 10^4',
      '-1000 <= nums[i] <= 1000',
      '-10^7 <= k <= 10^7',
    ],
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2' },
      { input: 'nums = [1,2,3], k = 3', output: '2' },
    ],
    difficulty: 'hard',
    difficultyScore: 6,
    concepts: ['hashmaps', 'arrays'],
    testCases: [
      { input: '[1,1,1]\n2', expectedOutput: '2', isHidden: false },
      { input: '[1,2,3]\n3', expectedOutput: '2', isHidden: false },
      { input: '[1,-1,0]\n0', expectedOutput: '3', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use prefix sums. If prefixSum[j] - prefixSum[i] = k, subarray (i,j] sums to k.' },
      { level: 2, content: 'Store prefix sum frequencies in a hash map.' },
      { level: 3, content: 'For each prefix sum, check how many times (prefixSum - k) has occurred.' },
    ],
    starterCode: new Map([
      ['python', 'def subarraySum(nums: list[int], k: int) -> int:\n    # Your code here\n    pass'],
      ['javascript', 'function subarraySum(nums, k) {\n    // Your code here\n}'],
      ['typescript', 'function subarraySum(nums: number[], k: number): number {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\nclass SubarraySum {\n    public int subarraySum(int[] nums, int k) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass SubarraySum {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    successRate: 32,
    popularity: 70,
  },

  // ============================================
  // LINKED LISTS (6 problems: 2 easy, 2 medium, 2 hard)
  // ============================================
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.`,
    constraints: [
      'The number of nodes in the list is in the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['linked-lists'],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use three pointers: prev, curr, next.' },
      { level: 2, content: 'At each step, reverse the current node\'s pointer.' },
      { level: 3, content: 'Save next, point curr to prev, move prev to curr, move curr to next.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head: ListNode) -> ListNode:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for singly-linked list.\nclass ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\nfunction reverseList(head) {\n    // Your code here\n}'],
      ['typescript', '// Definition for singly-linked list.\nclass ListNode {\n    val: number;\n    next: ListNode | null;\n    constructor(val?: number, next?: ListNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.next = (next === undefined ? null : next);\n    }\n}\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n    // Your code here\n}'],
      ['java', '// Definition for singly-linked list.\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\nclass ReverseList {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n        return null;\n    }\n}'],
      ['cpp', '// Definition for singly-linked list.\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass ReverseList {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n        return nullptr;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 55,
    popularity: 85,
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.',
    ],
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['linked-lists'],
    testCases: [
      { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
      { input: '[]\n[]', expectedOutput: '[]', isHidden: false },
      { input: '[]\n[0]', expectedOutput: '[0]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use a dummy head to simplify edge cases.' },
      { level: 2, content: 'Compare nodes from both lists, append smaller one.' },
      { level: 3, content: 'After one list is exhausted, append remaining nodes from the other.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef mergeTwoLists(list1: ListNode, list2: ListNode) -> ListNode:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for singly-linked list.\nclass ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\nfunction mergeTwoLists(list1, list2) {\n    // Your code here\n}'],
      ['typescript', '// Definition for singly-linked list.\nclass ListNode {\n    val: number;\n    next: ListNode | null;\n    constructor(val?: number, next?: ListNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.next = (next === undefined ? null : next);\n    }\n}\n\nfunction mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n    // Your code here\n}'],
      ['java', '// Definition for singly-linked list.\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\nclass MergeTwoLists {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your code here\n        return null;\n    }\n}'],
      ['cpp', '// Definition for singly-linked list.\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass MergeTwoLists {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Your code here\n        return nullptr;\n    }\n};'],
    ]),
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    successRate: 52,
    popularity: 80,
  },
  {
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    description: `Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the \`next\` pointer.

Return \`true\` if there is a cycle in the linked list. Otherwise, return \`false\`.`,
    constraints: [
      'The number of nodes in the list is in the range [0, 10^4].',
      '-10^5 <= Node.val <= 10^5',
    ],
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'There is a cycle where tail connects to index 1.' },
      { input: 'head = [1], pos = -1', output: 'false' },
    ],
    difficulty: 'medium',
    difficultyScore: 4,
    concepts: ['linked-lists', 'two-pointers'],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: 'false', isHidden: false },
      { input: '[1]', expectedOutput: 'false', isHidden: false },
      { input: '[]', expectedOutput: 'false', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use Floyd\'s cycle detection (tortoise and hare).' },
      { level: 2, content: 'Have two pointers: slow moves 1 step, fast moves 2 steps.' },
      { level: 3, content: 'If there\'s a cycle, fast will eventually meet slow. If fast reaches null, no cycle.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef hasCycle(head: ListNode) -> bool:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for singly-linked list.\nclass ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\nfunction hasCycle(head) {\n    // Your code here\n}'],
      ['typescript', '// Definition for singly-linked list.\nclass ListNode {\n    val: number;\n    next: ListNode | null;\n    constructor(val?: number, next?: ListNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.next = (next === undefined ? null : next);\n    }\n}\n\nfunction hasCycle(head: ListNode | null): boolean {\n    // Your code here\n}'],
      ['java', '// Definition for singly-linked list.\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n}\n\nclass HasCycle {\n    public boolean hasCycle(ListNode head) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '// Definition for singly-linked list.\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nclass HasCycle {\npublic:\n    bool hasCycle(ListNode* head) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 45,
    popularity: 75,
  },
  {
    title: 'Remove Nth Node From End of List',
    slug: 'remove-nth-node-from-end-of-list',
    description: `Given the \`head\` of a linked list, remove the \`n\`th node from the end of the list and return its head.`,
    constraints: [
      'The number of nodes in the list is sz.',
      '1 <= sz <= 30',
      '0 <= Node.val <= 100',
      '1 <= n <= sz',
    ],
    examples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' },
      { input: 'head = [1], n = 1', output: '[]' },
    ],
    difficulty: 'medium',
    difficultyScore: 4,
    concepts: ['linked-lists', 'two-pointers'],
    testCases: [
      { input: '[1,2,3,4,5]\n2', expectedOutput: '[1,2,3,5]', isHidden: false },
      { input: '[1]\n1', expectedOutput: '[]', isHidden: false },
      { input: '[1,2]\n1', expectedOutput: '[1]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use two pointers with n nodes gap between them.' },
      { level: 2, content: 'When fast pointer reaches end, slow is at the node before the target.' },
      { level: 3, content: 'Use a dummy node to handle edge case of removing head.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef removeNthFromEnd(head: ListNode, n: int) -> ListNode:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for singly-linked list.\nclass ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\nfunction removeNthFromEnd(head, n) {\n    // Your code here\n}'],
      ['typescript', '// Definition for singly-linked list.\nclass ListNode {\n    val: number;\n    next: ListNode | null;\n    constructor(val?: number, next?: ListNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.next = (next === undefined ? null : next);\n    }\n}\n\nfunction removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n    // Your code here\n}'],
      ['java', '// Definition for singly-linked list.\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\nclass RemoveNthFromEnd {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        // Your code here\n        return null;\n    }\n}'],
      ['cpp', '// Definition for singly-linked list.\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass RemoveNthFromEnd {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        // Your code here\n        return nullptr;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 40,
    popularity: 70,
  },
  {
    title: 'Reorder List',
    slug: 'reorder-list',
    description: `You are given the head of a singly linked-list: L0 → L1 → … → Ln-1 → Ln

Reorder the list to be: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …

You may not modify the values in the list's nodes. Only nodes themselves may be changed.`,
    constraints: [
      'The number of nodes in the list is in the range [1, 5 * 10^4].',
      '1 <= Node.val <= 1000',
    ],
    examples: [
      { input: 'head = [1,2,3,4]', output: '[1,4,2,3]' },
      { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]' },
    ],
    difficulty: 'hard',
    difficultyScore: 6,
    concepts: ['linked-lists', 'two-pointers'],
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[1,4,2,3]', isHidden: false },
      { input: '[1,2,3,4,5]', expectedOutput: '[1,5,2,4,3]', isHidden: false },
      { input: '[1]', expectedOutput: '[1]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Break into three steps: find middle, reverse second half, merge.' },
      { level: 2, content: 'Use slow/fast pointers to find middle. Reverse second half in place.' },
      { level: 3, content: 'Merge by alternating: take from first, take from reversed second.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reorderList(head: ListNode) -> None:\n    # Your code here - modify in place\n    pass'],
      ['javascript', '// Definition for singly-linked list.\nclass ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\nfunction reorderList(head) {\n    // Your code here - modify in place\n}'],
      ['typescript', '// Definition for singly-linked list.\nclass ListNode {\n    val: number;\n    next: ListNode | null;\n    constructor(val?: number, next?: ListNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.next = (next === undefined ? null : next);\n    }\n}\n\nfunction reorderList(head: ListNode | null): void {\n    // Your code here - modify in place\n}'],
      ['java', '// Definition for singly-linked list.\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\nclass ReorderList {\n    public void reorderList(ListNode head) {\n        // Your code here - modify in place\n    }\n}'],
      ['cpp', '// Definition for singly-linked list.\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass ReorderList {\npublic:\n    void reorderList(ListNode* head) {\n        // Your code here - modify in place\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    successRate: 30,
    popularity: 65,
  },
  {
    title: 'Merge K Sorted Lists',
    slug: 'merge-k-sorted-lists',
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4',
      'lists[i] is sorted in ascending order.',
      'The sum of lists[i].length will not exceed 10^4.',
    ],
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' },
    ],
    difficulty: 'hard',
    difficultyScore: 7,
    concepts: ['linked-lists', 'heaps'],
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
      { input: '[[]]', expectedOutput: '[]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use a min-heap to efficiently get the smallest element.' },
      { level: 2, content: 'Add head of each list to heap. Pop min, add its next to heap.' },
      { level: 3, content: 'Alternative: divide and conquer - merge pairs of lists repeatedly.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef mergeKLists(lists: list[ListNode]) -> ListNode:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for singly-linked list.\nclass ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\nfunction mergeKLists(lists) {\n    // Your code here\n}'],
      ['typescript', '// Definition for singly-linked list.\nclass ListNode {\n    val: number;\n    next: ListNode | null;\n    constructor(val?: number, next?: ListNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.next = (next === undefined ? null : next);\n    }\n}\n\nfunction mergeKLists(lists: Array<ListNode | null>): ListNode | null {\n    // Your code here\n}'],
      ['java', 'import java.util.*;\n\n// Definition for singly-linked list.\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\nclass MergeKLists {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Your code here\n        return null;\n    }\n}'],
      ['cpp', '#include <vector>\n#include <queue>\nusing namespace std;\n\n// Definition for singly-linked list.\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass MergeKLists {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        // Your code here\n        return nullptr;\n    }\n};'],
    ]),
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    successRate: 28,
    popularity: 80,
  },

  // ============================================
  // TREES (6 problems: 2 easy, 2 medium, 2 hard)
  // ============================================
  {
    title: 'Maximum Depth of Binary Tree',
    slug: 'maximum-depth-of-binary-tree',
    description: `Given the \`root\` of a binary tree, return its maximum depth.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    constraints: [
      'The number of nodes in the tree is in the range [0, 10^4].',
      '-100 <= Node.val <= 100',
    ],
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['trees', 'recursion', 'dfs'],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '3', isHidden: false },
      { input: '[1,null,2]', expectedOutput: '2', isHidden: false },
      { input: '[]', expectedOutput: '0', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use recursion. What is the depth of a tree?' },
      { level: 2, content: 'Depth = 1 + max(depth of left subtree, depth of right subtree).' },
      { level: 3, content: 'Base case: null node has depth 0. Recursively compute max of children + 1.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef maxDepth(root: TreeNode) -> int:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for a binary tree node.\nclass TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nfunction maxDepth(root) {\n    // Your code here\n}'],
      ['typescript', '// Definition for a binary tree node.\nclass TreeNode {\n    val: number;\n    left: TreeNode | null;\n    right: TreeNode | null;\n    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.left = (left === undefined ? null : left);\n        this.right = (right === undefined ? null : right);\n    }\n}\n\nfunction maxDepth(root: TreeNode | null): number {\n    // Your code here\n}'],
      ['java', '// Definition for a binary tree node.\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nclass MaxDepth {\n    public int maxDepth(TreeNode root) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '// Definition for a binary tree node.\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass MaxDepth {\npublic:\n    int maxDepth(TreeNode* root) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    successRate: 60,
    popularity: 75,
  },
  {
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    description: `Given the \`root\` of a binary tree, invert the tree, and return its root.

Inverting a binary tree means swapping the left and right children of all nodes in the tree.`,
    constraints: [
      'The number of nodes in the tree is in the range [0, 100].',
      '-100 <= Node.val <= 100',
    ],
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = [2,1,3]', output: '[2,3,1]' },
    ],
    difficulty: 'easy',
    difficultyScore: 2,
    concepts: ['trees', 'recursion', 'dfs'],
    testCases: [
      { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]', isHidden: false },
      { input: '[2,1,3]', expectedOutput: '[2,3,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Swap left and right children of each node.' },
      { level: 2, content: 'Use recursion: swap children, then recursively invert subtrees.' },
      { level: 3, content: 'Base case: null node. Swap left/right, recursively call on both.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef invertTree(root: TreeNode) -> TreeNode:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for a binary tree node.\nclass TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nfunction invertTree(root) {\n    // Your code here\n}'],
      ['typescript', '// Definition for a binary tree node.\nclass TreeNode {\n    val: number;\n    left: TreeNode | null;\n    right: TreeNode | null;\n    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.left = (left === undefined ? null : left);\n        this.right = (right === undefined ? null : right);\n    }\n}\n\nfunction invertTree(root: TreeNode | null): TreeNode | null {\n    // Your code here\n}'],
      ['java', '// Definition for a binary tree node.\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nclass InvertTree {\n    public TreeNode invertTree(TreeNode root) {\n        // Your code here\n        return null;\n    }\n}'],
      ['cpp', '// Definition for a binary tree node.\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass InvertTree {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Your code here\n        return nullptr;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    successRate: 65,
    popularity: 80,
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
    ],
    difficulty: 'medium',
    difficultyScore: 4,
    concepts: ['trees', 'bfs', 'queues'],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false },
      { input: '[1]', expectedOutput: '[[1]]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use BFS with a queue.' },
      { level: 2, content: 'Process nodes level by level. Track level size before processing.' },
      { level: 3, content: 'For each level: record queue size, process that many nodes, add their children.' },
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
    successRate: 55,
    popularity: 70,
  },
  {
    title: 'Validate Binary Search Tree',
    slug: 'validate-binary-search-tree',
    description: `Given the \`root\` of a binary tree, determine if it is a valid binary search tree (BST).

A **valid BST** is defined as follows:
- The left subtree of a node contains only nodes with keys **less than** the node's key.
- The right subtree of a node contains only nodes with keys **greater than** the node's key.
- Both the left and right subtrees must also be binary search trees.`,
    constraints: [
      'The number of nodes in the tree is in the range [1, 10^4].',
      '-2^31 <= Node.val <= 2^31 - 1',
    ],
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'The root\'s right child is 4 but has 3 in its subtree.' },
    ],
    difficulty: 'medium',
    difficultyScore: 5,
    concepts: ['trees', 'dfs', 'recursion'],
    testCases: [
      { input: '[2,1,3]', expectedOutput: 'true', isHidden: false },
      { input: '[5,1,4,null,null,3,6]', expectedOutput: 'false', isHidden: false },
      { input: '[5,4,6,null,null,3,7]', expectedOutput: 'false', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Each node must be within a valid range.' },
      { level: 2, content: 'Pass min/max bounds down the recursion.' },
      { level: 3, content: 'For left child: upper bound = parent. For right child: lower bound = parent.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef isValidBST(root: TreeNode) -> bool:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for a binary tree node.\nclass TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nfunction isValidBST(root) {\n    // Your code here\n}'],
      ['typescript', '// Definition for a binary tree node.\nclass TreeNode {\n    val: number;\n    left: TreeNode | null;\n    right: TreeNode | null;\n    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.left = (left === undefined ? null : left);\n        this.right = (right === undefined ? null : right);\n    }\n}\n\nfunction isValidBST(root: TreeNode | null): boolean {\n    // Your code here\n}'],
      ['java', '// Definition for a binary tree node.\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nclass IsValidBST {\n    public boolean isValidBST(TreeNode root) {\n        // Your code here\n        return false;\n    }\n}'],
      ['cpp', '// Definition for a binary tree node.\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass IsValidBST {\npublic:\n    bool isValidBST(TreeNode* root) {\n        // Your code here\n        return false;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    successRate: 35,
    popularity: 75,
  },
  {
    title: 'Binary Tree Maximum Path Sum',
    slug: 'binary-tree-maximum-path-sum',
    description: `A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does not need to pass through the root.

The **path sum** of a path is the sum of the node's values in the path.

Given the \`root\` of a binary tree, return the maximum path sum of any **non-empty** path.`,
    constraints: [
      'The number of nodes in the tree is in the range [1, 3 * 10^4].',
      '-1000 <= Node.val <= 1000',
    ],
    examples: [
      { input: 'root = [1,2,3]', output: '6', explanation: 'The optimal path is 2 -> 1 -> 3 with sum 6.' },
      { input: 'root = [-10,9,20,null,null,15,7]', output: '42', explanation: 'The optimal path is 15 -> 20 -> 7 with sum 42.' },
    ],
    difficulty: 'hard',
    difficultyScore: 7,
    concepts: ['trees', 'dfs', 'dynamic-programming'],
    testCases: [
      { input: '[1,2,3]', expectedOutput: '6', isHidden: false },
      { input: '[-10,9,20,null,null,15,7]', expectedOutput: '42', isHidden: false },
      { input: '[-3]', expectedOutput: '-3', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'At each node, you can either continue the path or start fresh.' },
      { level: 2, content: 'For each node, compute max path going through it (left + node + right).' },
      { level: 3, content: 'Return to parent: max of (node, node+left, node+right). Track global max.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef maxPathSum(root: TreeNode) -> int:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for a binary tree node.\nclass TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nfunction maxPathSum(root) {\n    // Your code here\n}'],
      ['typescript', '// Definition for a binary tree node.\nclass TreeNode {\n    val: number;\n    left: TreeNode | null;\n    right: TreeNode | null;\n    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.left = (left === undefined ? null : left);\n        this.right = (right === undefined ? null : right);\n    }\n}\n\nfunction maxPathSum(root: TreeNode | null): number {\n    // Your code here\n}'],
      ['java', '// Definition for a binary tree node.\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nclass MaxPathSum {\n    public int maxPathSum(TreeNode root) {\n        // Your code here\n        return 0;\n    }\n}'],
      ['cpp', '#include <algorithm>\nusing namespace std;\n\n// Definition for a binary tree node.\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass MaxPathSum {\npublic:\n    int maxPathSum(TreeNode* root) {\n        // Your code here\n        return 0;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    successRate: 25,
    popularity: 80,
  },
  {
    title: 'Lowest Common Ancestor of a Binary Tree',
    slug: 'lowest-common-ancestor-of-a-binary-tree',
    description: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.

The lowest common ancestor is defined as the lowest node in the tree that has both \`p\` and \`q\` as descendants (where we allow a node to be a descendant of itself).`,
    constraints: [
      'The number of nodes in the tree is in the range [2, 10^5].',
      '-10^9 <= Node.val <= 10^9',
      'All Node.val are unique.',
      'p != q',
      'p and q will exist in the tree.',
    ],
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3', explanation: 'The LCA of nodes 5 and 1 is 3.' },
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5', explanation: 'The LCA of nodes 5 and 4 is 5.' },
    ],
    difficulty: 'hard',
    difficultyScore: 6,
    concepts: ['trees', 'dfs', 'recursion'],
    testCases: [
      { input: '[3,5,1,6,2,0,8,null,null,7,4]\n5\n1', expectedOutput: '3', isHidden: false },
      { input: '[3,5,1,6,2,0,8,null,null,7,4]\n5\n4', expectedOutput: '5', isHidden: false },
      { input: '[1,2]\n1\n2', expectedOutput: '1', isHidden: true },
    ],
    hints: [
      { level: 1, content: 'Use recursion. What does finding p or q in a subtree tell you?' },
      { level: 2, content: 'If both left and right subtrees return non-null, current node is LCA.' },
      { level: 3, content: 'Return p/q if found, null otherwise. If both children return non-null, return current.' },
    ],
    starterCode: new Map([
      ['python', '# Definition for a binary tree node.\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef lowestCommonAncestor(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n    # Your code here\n    pass'],
      ['javascript', '// Definition for a binary tree node.\nclass TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n    // Your code here\n}'],
      ['typescript', '// Definition for a binary tree node.\nclass TreeNode {\n    val: number;\n    left: TreeNode | null;\n    right: TreeNode | null;\n    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n        this.val = (val === undefined ? 0 : val);\n        this.left = (left === undefined ? null : left);\n        this.right = (right === undefined ? null : right);\n    }\n}\n\nfunction lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {\n    // Your code here\n}'],
      ['java', '// Definition for a binary tree node.\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n}\n\nclass LowestCommonAncestor {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        // Your code here\n        return null;\n    }\n}'],
      ['cpp', '// Definition for a binary tree node.\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nclass LowestCommonAncestor {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        // Your code here\n        return nullptr;\n    }\n};'],
    ]),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    successRate: 35,
    popularity: 75,
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
      console.log(`  Created: ${problem.title} (${problem.difficulty}) - ${problem.concepts.join(', ')}`);
    }

    console.log(`\nSuccessfully seeded ${problems.length} problems!`);

    // Summary by category
    const byCategory: Record<string, number> = {};
    for (const p of problems) {
      const mainConcept = p.concepts[0];
      byCategory[mainConcept] = (byCategory[mainConcept] || 0) + 1;
    }
    console.log('\nProblems by main concept:');
    Object.entries(byCategory).forEach(([concept, count]) => {
      console.log(`  ${concept}: ${count}`);
    });
  } catch (error) {
    console.error('Error seeding problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedProblems();
