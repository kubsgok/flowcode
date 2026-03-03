import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { config } from '../config/env';
import { runCodeLocally } from '../services/localCodeRunner';

// Solutions for all 30 problems in TypeScript
const solutions: Record<string, string> = {
  // ARRAYS
  'two-sum': `
function twoSum(nums: number[], target: number): number[] {
  const seen: Record<number, number> = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in seen) {
      return [seen[complement], i];
    }
    seen[nums[i]] = i;
  }
  return [];
}
`,

  'best-time-to-buy-and-sell-stock': `
function maxProfit(prices: number[]): number {
  if (!prices || prices.length === 0) return 0;
  let minPrice = prices[0];
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else {
      maxProfit = Math.max(maxProfit, price - minPrice);
    }
  }
  return maxProfit;
}
`,

  'container-with-most-water': `
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    maxArea = Math.max(maxArea, area);
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxArea;
}
`,

  'product-of-array-except-self': `
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const result: number[] = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}
`,

  'maximum-subarray': `
function maxSubArray(nums: number[]): number {
  let currentMax = nums[0];
  let globalMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    globalMax = Math.max(globalMax, currentMax);
  }
  return globalMax;
}
`,

  'trapping-rain-water': `
function trap(height: number[]): number {
  if (!height || height.length === 0) return 0;
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  return water;
}
`,

  // STRINGS
  'valid-palindrome': `
function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}
`,

  'valid-anagram': `
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count: Record<string, number> = {};
  for (const c of s) {
    count[c] = (count[c] || 0) + 1;
  }
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}
`,

  'longest-substring-without-repeating-characters': `
function lengthOfLongestSubstring(s: string): number {
  const charIndex: Record<string, number> = {};
  let maxLen = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c in charIndex && charIndex[c] >= start) {
      start = charIndex[c] + 1;
    }
    charIndex[c] = i;
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}
`,

  'string-to-integer-atoi': `
function myAtoi(s: string): number {
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;
  s = s.trimStart();
  if (!s) return 0;
  let sign = 1;
  let i = 0;
  if (s[0] === '-') {
    sign = -1;
    i = 1;
  } else if (s[0] === '+') {
    i = 1;
  }
  let result = 0;
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    result = result * 10 + parseInt(s[i]);
    i++;
  }
  result *= sign;
  return Math.max(INT_MIN, Math.min(INT_MAX, result));
}
`,

  'longest-palindromic-substring': `
function longestPalindrome(s: string): string {
  if (!s) return "";
  let start = 0;
  let end = 0;
  function expand(l: number, r: number): [number, number] {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    return [l + 1, r - 1];
  }
  for (let i = 0; i < s.length; i++) {
    const [l1, r1] = expand(i, i);
    const [l2, r2] = expand(i, i + 1);
    if (r1 - l1 > end - start) {
      start = l1;
      end = r1;
    }
    if (r2 - l2 > end - start) {
      start = l2;
      end = r2;
    }
  }
  return s.slice(start, end + 1);
}
`,

  'minimum-window-substring': `
function minWindow(s: string, t: string): string {
  if (!s || !t) return "";
  const need: Record<string, number> = {};
  for (const c of t) {
    need[c] = (need[c] || 0) + 1;
  }
  const have: Record<string, number> = {};
  let required = Object.keys(need).length;
  let formed = 0;
  let left = 0;
  let minLen = Infinity;
  let minStart = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    have[c] = (have[c] || 0) + 1;
    if (c in need && have[c] === need[c]) {
      formed++;
    }
    while (formed === required) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }
      const leftChar = s[left];
      have[leftChar]--;
      if (leftChar in need && have[leftChar] < need[leftChar]) {
        formed--;
      }
      left++;
    }
  }
  return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}
`,

  // HASHMAPS
  'contains-duplicate': `
function containsDuplicate(nums: number[]): boolean {
  return new Set(nums).size !== nums.length;
}
`,

  'ransom-note': `
function canConstruct(ransomNote: string, magazine: string): boolean {
  const magCount: Record<string, number> = {};
  for (const c of magazine) {
    magCount[c] = (magCount[c] || 0) + 1;
  }
  for (const c of ransomNote) {
    if (!magCount[c] || magCount[c] === 0) return false;
    magCount[c]--;
  }
  return true;
}
`,

  'group-anagrams': `
function groupAnagrams(strs: string[]): string[][] {
  const groups: Record<string, string[]> = {};
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return Object.values(groups);
}
`,

  'top-k-frequent-elements': `
function topKFrequent(nums: number[], k: number): number[] {
  const count: Record<number, number> = {};
  for (const num of nums) {
    count[num] = (count[num] || 0) + 1;
  }
  const sorted = Object.entries(count).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return parseInt(a[0]) - parseInt(b[0]);
  });
  return sorted.slice(0, k).map(([num]) => parseInt(num));
}
`,

  'longest-consecutive-sequence': `
function longestConsecutive(nums: number[]): number {
  const numSet = new Set(nums);
  let maxLen = 0;
  for (const num of numSet) {
    if (!numSet.has(num - 1)) {
      let current = num;
      let length = 1;
      while (numSet.has(current + 1)) {
        current++;
        length++;
      }
      maxLen = Math.max(maxLen, length);
    }
  }
  return maxLen;
}
`,

  'subarray-sum-equals-k': `
function subarraySum(nums: number[], k: number): number {
  let count = 0;
  let prefixSum = 0;
  const sumCount: Record<number, number> = { 0: 1 };
  for (const num of nums) {
    prefixSum += num;
    if (prefixSum - k in sumCount) {
      count += sumCount[prefixSum - k];
    }
    sumCount[prefixSum] = (sumCount[prefixSum] || 0) + 1;
  }
  return count;
}
`,

  // LINKED LISTS
  'reverse-linked-list': `
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const nextNode = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  return prev;
}
`,

  'merge-two-sorted-lists': `
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let curr = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      curr.next = list1;
      list1 = list1.next;
    } else {
      curr.next = list2;
      list2 = list2.next;
    }
    curr = curr.next;
  }
  curr.next = list1 || list2;
  return dummy.next;
}
`,

  'linked-list-cycle': `
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
`,

  'remove-nth-node-from-end-of-list': `
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let fast: ListNode | null = dummy;
  let slow: ListNode | null = dummy;
  for (let i = 0; i <= n; i++) {
    fast = fast!.next;
  }
  while (fast) {
    fast = fast.next;
    slow = slow!.next;
  }
  slow!.next = slow!.next!.next;
  return dummy.next;
}
`,

  'reorder-list': `
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function reorderList(head: ListNode | null): void {
  if (!head || !head.next) return;
  let slow: ListNode | null = head;
  let fast: ListNode | null = head;
  while (fast.next && fast.next.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  let second: ListNode | null = slow!.next;
  slow!.next = null;
  let prev: ListNode | null = null;
  while (second) {
    const tmp = second.next;
    second.next = prev;
    prev = second;
    second = tmp;
  }
  let first: ListNode | null = head;
  second = prev;
  while (second) {
    const tmp1 = first!.next;
    const tmp2 = second.next;
    first!.next = second;
    second.next = tmp1;
    first = tmp1;
    second = tmp2;
  }
}
`,

  'merge-k-sorted-lists': `
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  if (!lists || lists.length === 0) return null;
  const values: number[] = [];
  for (const list of lists) {
    let curr = list;
    while (curr) {
      values.push(curr.val);
      curr = curr.next;
    }
  }
  values.sort((a, b) => a - b);
  const dummy = new ListNode();
  let curr = dummy;
  for (const val of values) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}
`,

  // TREES
  'maximum-depth-of-binary-tree': `
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
`,

  'invert-binary-tree': `
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  const temp = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(temp);
  return root;
}
`,

  'binary-tree-level-order-traversal': `
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  let queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const level: number[] = [];
    const nextQueue: TreeNode[] = [];
    for (const node of queue) {
      level.push(node.val);
      if (node.left) nextQueue.push(node.left);
      if (node.right) nextQueue.push(node.right);
    }
    result.push(level);
    queue = nextQueue;
  }
  return result;
}
`,

  'validate-binary-search-tree': `
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function isValidBST(root: TreeNode | null): boolean {
  function validate(node: TreeNode | null, min: number, max: number): boolean {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left, min, node.val) && validate(node.right, node.val, max);
  }
  return validate(root, -Infinity, Infinity);
}
`,

  'binary-tree-maximum-path-sum': `
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function maxPathSum(root: TreeNode | null): number {
  let maxSum = -Infinity;
  function dfs(node: TreeNode | null): number {
    if (!node) return 0;
    const left = Math.max(0, dfs(node.left));
    const right = Math.max(0, dfs(node.right));
    maxSum = Math.max(maxSum, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  dfs(root);
  return maxSum;
}
`,

  'lowest-common-ancestor-of-a-binary-tree': `
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function lowestCommonAncestor(root: TreeNode | null, p: TreeNode | null, q: TreeNode | null): TreeNode | null {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}
`,
};

async function runTest(slug: string, code: string, testCases: { input: string; expectedOutput: string; isHidden: boolean }[]) {
  console.log(`\n  Testing: ${slug}`);

  const results = await runCodeLocally(code, 'typescript', testCases);

  let passed = 0;
  let failed = 0;

  for (const result of results.testCaseResults) {
    if (result.passed) {
      passed++;
    } else {
      failed++;
      console.log(`    FAIL Test ${result.testCaseIndex + 1}:`);
      console.log(`      Input: ${result.input}`);
      console.log(`      Expected: ${result.expectedOutput}`);
      console.log(`      Actual: ${result.actualOutput}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }
  }

  const status = failed === 0 ? '✓' : '✗';
  console.log(`    ${status} ${passed}/${testCases.length} tests passed`);

  return { passed, failed, total: testCases.length };
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(config.mongodb.uri);
  console.log('Connected to MongoDB\n');

  console.log('Testing all problems with TypeScript solutions...');
  console.log('='.repeat(50));

  const problems = await Problem.find({}).lean();

  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;
  const failedProblems: string[] = [];

  for (const problem of problems) {
    const slug = problem.slug;
    const solution = solutions[slug];

    if (!solution) {
      console.log(`\n  SKIP: ${slug} (no solution provided)`);
      continue;
    }

    const testCases = problem.testCases || [];
    if (testCases.length === 0) {
      console.log(`\n  SKIP: ${slug} (no test cases)`);
      continue;
    }

    const result = await runTest(slug, solution, testCases as any);
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalTests += result.total;

    if (result.failed > 0) {
      failedProblems.push(slug);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);

  if (failedProblems.length > 0) {
    console.log(`\nFailed problems: ${failedProblems.join(', ')}`);
  } else {
    console.log('\nAll problems passed!');
  }

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
}

main().catch(console.error);
