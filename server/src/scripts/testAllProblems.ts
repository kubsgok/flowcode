import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { config } from '../config/env';
import { runCodeLocally } from '../services/localCodeRunner';

// Solutions for all 30 problems in Python
const solutions: Record<string, string> = {
  // ARRAYS
  'two-sum': `
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,

  'best-time-to-buy-and-sell-stock': `
def maxProfit(prices: list[int]) -> int:
    if not prices:
        return 0
    min_price = prices[0]
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        else:
            max_profit = max(max_profit, price - min_price)
    return max_profit
`,

  'container-with-most-water': `
def maxArea(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    max_area = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        max_area = max(max_area, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_area
`,

  'product-of-array-except-self': `
def productExceptSelf(nums: list[int]) -> list[int]:
    n = len(nums)
    result = [1] * n
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]
    return result
`,

  'maximum-subarray': `
def maxSubArray(nums: list[int]) -> int:
    current_max = global_max = nums[0]
    for i in range(1, len(nums)):
        current_max = max(nums[i], current_max + nums[i])
        global_max = max(global_max, current_max)
    return global_max
`,

  'trapping-rain-water': `
def trap(height: list[int]) -> int:
    if not height:
        return 0
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water
`,

  // STRINGS
  'valid-palindrome': `
def isPalindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]
`,

  'valid-anagram': `
def isAnagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        if c not in count or count[c] == 0:
            return False
        count[c] -= 1
    return True
`,

  'longest-substring-without-repeating-characters': `
def lengthOfLongestSubstring(s: str) -> int:
    char_index = {}
    max_len = 0
    start = 0
    for i, c in enumerate(s):
        if c in char_index and char_index[c] >= start:
            start = char_index[c] + 1
        char_index[c] = i
        max_len = max(max_len, i - start + 1)
    return max_len
`,

  'string-to-integer-atoi': `
def myAtoi(s: str) -> int:
    INT_MAX = 2**31 - 1
    INT_MIN = -2**31
    s = s.lstrip()
    if not s:
        return 0
    sign = 1
    i = 0
    if s[0] == '-':
        sign = -1
        i = 1
    elif s[0] == '+':
        i = 1
    result = 0
    while i < len(s) and s[i].isdigit():
        result = result * 10 + int(s[i])
        i += 1
    result *= sign
    return max(INT_MIN, min(INT_MAX, result))
`,

  'longest-palindromic-substring': `
def longestPalindrome(s: str) -> str:
    if not s:
        return ""
    start = end = 0
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return l + 1, r - 1
    for i in range(len(s)):
        l1, r1 = expand(i, i)
        l2, r2 = expand(i, i + 1)
        if r1 - l1 > end - start:
            start, end = l1, r1
        if r2 - l2 > end - start:
            start, end = l2, r2
    return s[start:end + 1]
`,

  'minimum-window-substring': `
def minWindow(s: str, t: str) -> str:
    from collections import Counter
    if not s or not t:
        return ""
    need = Counter(t)
    have = {}
    required = len(need)
    formed = 0
    left = 0
    min_len = float('inf')
    min_start = 0
    for right, c in enumerate(s):
        have[c] = have.get(c, 0) + 1
        if c in need and have[c] == need[c]:
            formed += 1
        while formed == required:
            if right - left + 1 < min_len:
                min_len = right - left + 1
                min_start = left
            left_char = s[left]
            have[left_char] -= 1
            if left_char in need and have[left_char] < need[left_char]:
                formed -= 1
            left += 1
    return "" if min_len == float('inf') else s[min_start:min_start + min_len]
`,

  // HASHMAPS
  'contains-duplicate': `
def containsDuplicate(nums: list[int]) -> bool:
    return len(nums) != len(set(nums))
`,

  'ransom-note': `
def canConstruct(ransomNote: str, magazine: str) -> bool:
    from collections import Counter
    mag_count = Counter(magazine)
    for c in ransomNote:
        if mag_count.get(c, 0) == 0:
            return False
        mag_count[c] -= 1
    return True
`,

  'group-anagrams': `
def groupAnagrams(strs: list[str]) -> list[list[str]]:
    groups = {}
    for s in strs:
        key = ''.join(sorted(s))
        if key not in groups:
            groups[key] = []
        groups[key].append(s)
    return list(groups.values())
`,

  'top-k-frequent-elements': `
def topKFrequent(nums: list[int], k: int) -> list[int]:
    from collections import Counter
    count = Counter(nums)
    return [x for x, _ in count.most_common(k)]
`,

  'longest-consecutive-sequence': `
def longestConsecutive(nums: list[int]) -> int:
    num_set = set(nums)
    max_len = 0
    for num in num_set:
        if num - 1 not in num_set:
            current = num
            length = 1
            while current + 1 in num_set:
                current += 1
                length += 1
            max_len = max(max_len, length)
    return max_len
`,

  'subarray-sum-equals-k': `
def subarraySum(nums: list[int], k: int) -> int:
    count = 0
    prefix_sum = 0
    sum_count = {0: 1}
    for num in nums:
        prefix_sum += num
        if prefix_sum - k in sum_count:
            count += sum_count[prefix_sum - k]
        sum_count[prefix_sum] = sum_count.get(prefix_sum, 0) + 1
    return count
`,

  // LINKED LISTS
  'reverse-linked-list': `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev
`,

  'merge-two-sorted-lists': `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeTwoLists(list1, list2):
    dummy = ListNode()
    curr = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            curr.next = list1
            list1 = list1.next
        else:
            curr.next = list2
            list2 = list2.next
        curr = curr.next
    curr.next = list1 if list1 else list2
    return dummy.next
`,

  'linked-list-cycle': `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def hasCycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
`,

  'remove-nth-node-from-end-of-list': `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next
`,

  'reorder-list': `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reorderList(head) -> None:
    if not head or not head.next:
        return
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:
        tmp = second.next
        second.next = prev
        prev = second
        second = tmp
    first, second = head, prev
    while second:
        tmp1, tmp2 = first.next, second.next
        first.next = second
        second.next = tmp1
        first, second = tmp1, tmp2
`,

  'merge-k-sorted-lists': `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeKLists(lists):
    import heapq
    if not lists:
        return None
    dummy = ListNode()
    curr = dummy
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst.val, i, lst))
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next
`,

  // TREES
  'maximum-depth-of-binary-tree': `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def maxDepth(root) -> int:
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))
`,

  'invert-binary-tree': `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def invertTree(root):
    if not root:
        return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root
`,

  'binary-tree-level-order-traversal': `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def levelOrder(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        level = []
        next_queue = []
        for node in queue:
            level.append(node.val)
            if node.left:
                next_queue.append(node.left)
            if node.right:
                next_queue.append(node.right)
        result.append(level)
        queue = next_queue
    return result
`,

  'validate-binary-search-tree': `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def isValidBST(root) -> bool:
    def validate(node, min_val, max_val):
        if not node:
            return True
        if node.val <= min_val or node.val >= max_val:
            return False
        return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)
    return validate(root, float('-inf'), float('inf'))
`,

  'binary-tree-maximum-path-sum': `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def maxPathSum(root) -> int:
    max_sum = float('-inf')
    def dfs(node):
        nonlocal max_sum
        if not node:
            return 0
        left = max(0, dfs(node.left))
        right = max(0, dfs(node.right))
        max_sum = max(max_sum, node.val + left + right)
        return node.val + max(left, right)
    dfs(root)
    return max_sum
`,

  'lowest-common-ancestor-of-a-binary-tree': `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def lowestCommonAncestor(root, p, q):
    if not root or root == p or root == q:
        return root
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    if left and right:
        return root
    return left if left else right
`,
};

// Special test cases that need custom handling
const customTestCases: Record<string, { input: string; expectedOutput: string }[]> = {
  // Linked list problems need special input/output handling
  'reverse-linked-list': [
    { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
    { input: '[1,2]', expectedOutput: '[2,1]' },
    { input: '[]', expectedOutput: '[]' },
  ],
  'merge-two-sorted-lists': [
    { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
    { input: '[]\n[]', expectedOutput: '[]' },
  ],
  'linked-list-cycle': [
    { input: '[3,2,0,-4]\n1', expectedOutput: 'true' },
    { input: '[1]\n-1', expectedOutput: 'false' },
  ],
  'remove-nth-node-from-end-of-list': [
    { input: '[1,2,3,4,5]\n2', expectedOutput: '[1,2,3,5]' },
    { input: '[1]\n1', expectedOutput: '[]' },
  ],
  'reorder-list': [
    { input: '[1,2,3,4]', expectedOutput: '[1,4,2,3]' },
    { input: '[1,2,3,4,5]', expectedOutput: '[1,5,2,4,3]' },
  ],
  'merge-k-sorted-lists': [
    { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]' },
    { input: '[]', expectedOutput: '[]' },
  ],
  // Tree problems
  'invert-binary-tree': [
    { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]' },
    { input: '[2,1,3]', expectedOutput: '[2,3,1]' },
  ],
  'validate-binary-search-tree': [
    { input: '[2,1,3]', expectedOutput: 'true' },
    { input: '[5,1,4,null,null,3,6]', expectedOutput: 'false' },
  ],
  'binary-tree-maximum-path-sum': [
    { input: '[1,2,3]', expectedOutput: '6' },
    { input: '[-10,9,20,null,null,15,7]', expectedOutput: '42' },
  ],
  'lowest-common-ancestor-of-a-binary-tree': [
    { input: '[3,5,1,6,2,0,8,null,null,7,4]\n5\n1', expectedOutput: '3' },
    { input: '[3,5,1,6,2,0,8,null,null,7,4]\n5\n4', expectedOutput: '5' },
  ],
};

// Wrapper for linked list problems
const linkedListWrapper = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def list_to_linked(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

def linked_to_list(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result
`;

// Wrapper for tree serialization
const treeWrapper = `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def list_to_tree(arr):
    if not arr or arr[0] is None:
        return None
    from collections import deque
    root = TreeNode(arr[0])
    queue = deque([root])
    i = 1
    while queue and i < len(arr):
        node = queue.popleft()
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def tree_to_list(root):
    if not root:
        return []
    from collections import deque
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result
`;

async function runTest(slug: string, code: string, testCases: { input: string; expectedOutput: string; isHidden: boolean }[]) {
  console.log(`\n  Testing: ${slug}`);

  const results = await runCodeLocally(code, 'python', testCases);

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

  console.log('Testing all problems with Python solutions...');
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
