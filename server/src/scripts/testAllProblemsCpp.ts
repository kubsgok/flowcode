import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { config } from '../config/env';
import { runCodeLocally } from '../services/localCodeRunner';

// Solutions for all 30 problems in C++
const solutions: Record<string, string> = {
  // ARRAYS
  'two-sum': `
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,

  'best-time-to-buy-and-sell-stock': `
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        if (prices.empty()) return 0;
        int minPrice = prices[0];
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else {
                maxProfit = max(maxProfit, price - minPrice);
            }
        }
        return maxProfit;
    }
};
`,

  'container-with-most-water': `
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int maxArea = 0;
        while (left < right) {
            int area = min(height[left], height[right]) * (right - left);
            maxArea = max(maxArea, area);
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return maxArea;
    }
};
`,

  'product-of-array-except-self': `
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            result[i] = prefix;
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= suffix;
            suffix *= nums[i];
        }
        return result;
    }
};
`,

  'maximum-subarray': `
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int currentMax = nums[0];
        int globalMax = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            currentMax = max(nums[i], currentMax + nums[i]);
            globalMax = max(globalMax, currentMax);
        }
        return globalMax;
    }
};
`,

  'trapping-rain-water': `
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        if (height.empty()) return 0;
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;
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
};
`,

  // STRINGS
  'valid-palindrome': `
#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        string cleaned;
        for (char c : s) {
            if (isalnum(c)) {
                cleaned += tolower(c);
            }
        }
        int left = 0, right = cleaned.size() - 1;
        while (left < right) {
            if (cleaned[left] != cleaned[right]) return false;
            left++;
            right--;
        }
        return true;
    }
};
`,

  'valid-anagram': `
#include <string>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int count[26] = {0};
        for (char c : s) count[c - 'a']++;
        for (char c : t) {
            count[c - 'a']--;
            if (count[c - 'a'] < 0) return false;
        }
        return true;
    }
};
`,

  'longest-substring-without-repeating-characters': `
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> charIndex;
        int maxLen = 0;
        int start = 0;
        for (int i = 0; i < s.size(); i++) {
            char c = s[i];
            if (charIndex.count(c) && charIndex[c] >= start) {
                start = charIndex[c] + 1;
            }
            charIndex[c] = i;
            maxLen = max(maxLen, i - start + 1);
        }
        return maxLen;
    }
};
`,

  'string-to-integer-atoi': `
#include <string>
#include <climits>
using namespace std;

class Solution {
public:
    int myAtoi(string s) {
        int i = 0;
        while (i < s.size() && s[i] == ' ') i++;
        if (i >= s.size()) return 0;
        int sign = 1;
        if (s[i] == '-') {
            sign = -1;
            i++;
        } else if (s[i] == '+') {
            i++;
        }
        long result = 0;
        while (i < s.size() && isdigit(s[i])) {
            result = result * 10 + (s[i] - '0');
            if (result * sign > INT_MAX) return INT_MAX;
            if (result * sign < INT_MIN) return INT_MIN;
            i++;
        }
        return result * sign;
    }
};
`,

  'longest-palindromic-substring': `
#include <string>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        if (s.empty()) return "";
        int start = 0, maxLen = 1;
        for (int i = 0; i < s.size(); i++) {
            int len1 = expand(s, i, i);
            int len2 = expand(s, i, i + 1);
            int len = max(len1, len2);
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;
            }
        }
        return s.substr(start, maxLen);
    }

    int expand(string& s, int left, int right) {
        while (left >= 0 && right < s.size() && s[left] == s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    }
};
`,

  'minimum-window-substring': `
#include <string>
#include <unordered_map>
#include <climits>
using namespace std;

class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";
        unordered_map<char, int> need, have;
        for (char c : t) need[c]++;
        int required = need.size();
        int formed = 0;
        int left = 0;
        int minLen = INT_MAX;
        int minStart = 0;
        for (int right = 0; right < s.size(); right++) {
            char c = s[right];
            have[c]++;
            if (need.count(c) && have[c] == need[c]) {
                formed++;
            }
            while (formed == required) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minStart = left;
                }
                char leftChar = s[left];
                have[leftChar]--;
                if (need.count(leftChar) && have[leftChar] < need[leftChar]) {
                    formed--;
                }
                left++;
            }
        }
        return minLen == INT_MAX ? "" : s.substr(minStart, minLen);
    }
};
`,

  // HASHMAPS
  'contains-duplicate': `
#include <vector>
#include <unordered_set>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int num : nums) {
            if (seen.count(num)) return true;
            seen.insert(num);
        }
        return false;
    }
};
`,

  'ransom-note': `
#include <string>
using namespace std;

class Solution {
public:
    bool canConstruct(string ransomNote, string magazine) {
        int count[26] = {0};
        for (char c : magazine) count[c - 'a']++;
        for (char c : ransomNote) {
            if (count[c - 'a'] <= 0) return false;
            count[c - 'a']--;
        }
        return true;
    }
};
`,

  'group-anagrams': `
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }
        vector<vector<string>> result;
        for (auto& p : groups) {
            result.push_back(p.second);
        }
        return result;
    }
};
`,

  'top-k-frequent-elements': `
#include <vector>
#include <unordered_map>
#include <queue>
using namespace std;

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int num : nums) count[num]++;
        auto cmp = [](pair<int, int>& a, pair<int, int>& b) {
            if (a.second != b.second) return a.second < b.second;
            return a.first > b.first;
        };
        priority_queue<pair<int, int>, vector<pair<int, int>>, decltype(cmp)> pq(cmp);
        for (auto& p : count) {
            pq.push({p.first, p.second});
        }
        vector<int> result;
        for (int i = 0; i < k; i++) {
            result.push_back(pq.top().first);
            pq.pop();
        }
        return result;
    }
};
`,

  'longest-consecutive-sequence': `
#include <vector>
#include <unordered_set>
#include <algorithm>
using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> numSet(nums.begin(), nums.end());
        int maxLen = 0;
        for (int num : numSet) {
            if (!numSet.count(num - 1)) {
                int current = num;
                int length = 1;
                while (numSet.count(current + 1)) {
                    current++;
                    length++;
                }
                maxLen = max(maxLen, length);
            }
        }
        return maxLen;
    }
};
`,

  'subarray-sum-equals-k': `
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int count = 0;
        int prefixSum = 0;
        unordered_map<int, int> sumCount;
        sumCount[0] = 1;
        for (int num : nums) {
            prefixSum += num;
            if (sumCount.count(prefixSum - k)) {
                count += sumCount[prefixSum - k];
            }
            sumCount[prefixSum]++;
        }
        return count;
    }
};
`,

  // LINKED LISTS
  'reverse-linked-list': `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* nextNode = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nextNode;
        }
        return prev;
    }
};
`,

  'merge-two-sorted-lists': `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy;
        ListNode* curr = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                curr->next = list1;
                list1 = list1->next;
            } else {
                curr->next = list2;
                list2 = list2->next;
            }
            curr = curr->next;
        }
        curr->next = list1 ? list1 : list2;
        return dummy.next;
    }
};
`,

  'linked-list-cycle': `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};
`,

  'remove-nth-node-from-end-of-list': `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* fast = &dummy;
        ListNode* slow = &dummy;
        for (int i = 0; i <= n; i++) {
            fast = fast->next;
        }
        while (fast) {
            fast = fast->next;
            slow = slow->next;
        }
        ListNode* toDelete = slow->next;
        slow->next = slow->next->next;
        delete toDelete;
        return dummy.next;
    }
};
`,

  'reorder-list': `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    void reorderList(ListNode* head) {
        if (!head || !head->next) return;
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* second = slow->next;
        slow->next = nullptr;
        ListNode* prev = nullptr;
        while (second) {
            ListNode* tmp = second->next;
            second->next = prev;
            prev = second;
            second = tmp;
        }
        ListNode* first = head;
        second = prev;
        while (second) {
            ListNode* tmp1 = first->next;
            ListNode* tmp2 = second->next;
            first->next = second;
            second->next = tmp1;
            first = tmp1;
            second = tmp2;
        }
    }
};
`,

  'merge-k-sorted-lists': `
#include <vector>
#include <queue>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (ListNode* list : lists) {
            if (list) pq.push(list);
        }
        ListNode dummy;
        ListNode* curr = &dummy;
        while (!pq.empty()) {
            ListNode* node = pq.top();
            pq.pop();
            curr->next = node;
            curr = curr->next;
            if (node->next) pq.push(node->next);
        }
        return dummy.next;
    }
};
`,

  // TREES
  'maximum-depth-of-binary-tree': `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};
`,

  'invert-binary-tree': `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* temp = root->left;
        root->left = invertTree(root->right);
        root->right = invertTree(temp);
        return root;
    }
};
`,

  'binary-tree-level-order-traversal': `
#include <vector>
#include <queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (!root) return result;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();
            vector<int> level;
            for (int i = 0; i < size; i++) {
                TreeNode* node = q.front();
                q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            result.push_back(level);
        }
        return result;
    }
};
`,

  'validate-binary-search-tree': `
#include <climits>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return validate(root, LLONG_MIN, LLONG_MAX);
    }

    bool validate(TreeNode* node, long long minVal, long long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val) &&
               validate(node->right, node->val, maxVal);
    }
};
`,

  'binary-tree-maximum-path-sum': `
#include <climits>
#include <algorithm>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int maxSum = INT_MIN;

    int maxPathSum(TreeNode* root) {
        dfs(root);
        return maxSum;
    }

    int dfs(TreeNode* node) {
        if (!node) return 0;
        int left = max(0, dfs(node->left));
        int right = max(0, dfs(node->right));
        maxSum = max(maxSum, node->val + left + right);
        return node->val + max(left, right);
    }
};
`,

  'lowest-common-ancestor-of-a-binary-tree': `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) return root;
        return left ? left : right;
    }
};
`,
};

async function runTest(slug: string, code: string, testCases: { input: string; expectedOutput: string; isHidden: boolean }[]) {
  console.log(`\n  Testing: ${slug}`);

  const results = await runCodeLocally(code, 'cpp', testCases);

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
        console.log(`      Error: ${result.error.substring(0, 200)}`);
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

  console.log('Testing all problems with C++ solutions...');
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
    console.log('\nAll tested problems passed!');
  }

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
}

main().catch(console.error);
