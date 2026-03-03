import { spawn, execSync } from 'child_process';
import { TestCaseResult } from '@flowcode/shared';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface LocalExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  timedOut: boolean;
}

const TIMEOUT_MS = 5000; // 5 second timeout

/**
 * Wrap user's Python code to handle input/output automatically
 */
function wrapPythonCode(userCode: string, input: string): string {
  // Parse the input to determine function arguments
  const lines = input.split('\n').filter(l => l.trim());

  // Try to detect the function name from user code
  // Skip __init__, __str__, etc. - look for the first non-dunder function
  const allFuncs = [...userCode.matchAll(/def\s+(\w+)\s*\(/g)];
  const nonDunderFunc = allFuncs.find(m => !m[1].startsWith('__'));
  const funcName = nonDunderFunc ? nonDunderFunc[1] : (allFuncs[0] ? allFuncs[0][1] : 'solution');

  // Check if this is a tree or linked list problem
  const isTreeProblem = funcName === 'levelOrder' || funcName === 'maxDepth' || funcName === 'invertTree' ||
    funcName === 'isValidBST' || funcName === 'maxPathSum' || funcName === 'lowestCommonAncestor' ||
    userCode.includes('TreeNode');
  const isLinkedListProblem = funcName === 'reverseList' || funcName === 'mergeTwoLists' ||
    funcName === 'hasCycle' || funcName === 'removeNthFromEnd' || funcName === 'reorderList' ||
    funcName === 'mergeKLists' || userCode.includes('ListNode');

  // Build the wrapper code
  const wrapper = `
import json
import ast
from collections import deque

# User's code
${userCode}

# Build tree from level-order list like [3,9,20,None,None,15,7]
def build_tree(values):
    if not values or values[0] is None:
        return None

    root = TreeNode(values[0])
    queue = deque([root])
    i = 1

    while queue and i < len(values):
        node = queue.popleft()

        # Left child
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1

        # Right child
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1

    return root

# Convert tree to level-order list
def tree_to_list(root):
    if not root:
        return []
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
    # Remove trailing Nones
    while result and result[-1] is None:
        result.pop()
    return result

# Build linked list from array
def build_linked_list(values):
    if not values:
        return None
    head = ListNode(values[0])
    curr = head
    for val in values[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

# Convert linked list to array
def linked_list_to_array(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

# Parse inputs
inputs = ${JSON.stringify(lines)}
args = []
for inp in inputs:
    inp = inp.strip()
    try:
        # Try to parse as Python literal (list, dict, int, etc.)
        parsed = ast.literal_eval(inp.replace('null', 'None'))
        args.append(parsed)
    except:
        # If it fails, treat as string (remove quotes if present)
        if inp.startswith('"') and inp.endswith('"'):
            args.append(inp[1:-1])
        elif inp.startswith("'") and inp.endswith("'"):
            args.append(inp[1:-1])
        else:
            args.append(inp)

# Find node by value in tree
def find_node(root, val):
    if not root:
        return None
    if root.val == val:
        return root
    left = find_node(root.left, val)
    if left:
        return left
    return find_node(root.right, val)

# Handle tree problems specially
${isTreeProblem ? `
# Convert first arg from list to TreeNode
tree_root = None
if args and isinstance(args[0], list):
    tree_root = build_tree(args[0])
    args[0] = tree_root

# For LCA, convert p and q values to TreeNode objects
if '${funcName}' == 'lowestCommonAncestor' and len(args) >= 3:
    if isinstance(args[1], int):
        args[1] = find_node(tree_root, args[1])
    if isinstance(args[2], int):
        args[2] = find_node(tree_root, args[2])
` : ''}

# Handle linked list problems specially
${isLinkedListProblem ? `
# For reorderList, keep reference to head
original_head = None

# Convert list args to ListNode
for i, arg in enumerate(args):
    if isinstance(arg, list):
        # Check if it's a list of lists (like for mergeKLists)
        if arg and isinstance(arg[0], list):
            args[i] = [build_linked_list(inner) for inner in arg]
        elif all(isinstance(x, int) or x is None for x in arg):
            converted = build_linked_list(arg)
            if i == 0:
                original_head = converted
            args[i] = converted
` : ''}

# Call the function
result = ${funcName}(*args)

# Print result in expected format
${isLinkedListProblem ? `
# Handle in-place modification (reorderList returns None)
if '${funcName}' == 'reorderList' and result is None and original_head is not None:
    result = original_head

# Convert linked list result back to array
if result is not None and hasattr(result, 'val'):
    result = linked_list_to_array(result)
elif result is None:
    result = []
` : ''}

${isTreeProblem ? `
# Convert tree result back to list or extract value
if result is not None and hasattr(result, 'val'):
    if '${funcName}' == 'lowestCommonAncestor':
        # Just return the node's value
        result = result.val
    else:
        result = tree_to_list(result)
elif result is None and '${funcName}' in ['invertTree']:
    result = []
` : ''}

if isinstance(result, bool):
    print(str(result).lower())
elif isinstance(result, list):
    print(json.dumps(result).replace(' ', ''))
else:
    print(result)
`;
  return wrapper;
}

/**
 * Execute Python code locally
 */
async function executePython(code: string, input: string): Promise<LocalExecutionResult> {
  const wrappedCode = wrapPythonCode(code, input);

  return new Promise((resolve) => {
    const process = spawn('python3', ['-c', wrappedCode], {
      timeout: TIMEOUT_MS,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // No need to send input to stdin anymore - it's embedded in the code
    process.stdin.end();

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      process.kill('SIGKILL');
    }, TIMEOUT_MS);

    process.on('close', (code) => {
      clearTimeout(timeout);
      resolve({
        output: stdout.trim(),
        error: stderr.trim(),
        exitCode: code ?? 1,
        timedOut,
      });
    });

    process.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        output: '',
        error: err.message,
        exitCode: 1,
        timedOut: false,
      });
    });
  });
}

/**
 * Execute JavaScript code locally using Node.js
 */
async function executeJavaScript(code: string, input: string): Promise<LocalExecutionResult> {
  // Parse input lines
  const lines = input.split('\n').filter(l => l.trim());

  // Detect function name - skip constructor and class methods
  const allFuncs = [...code.matchAll(/function\s+(\w+)\s*\(/g)];
  const nonClassFunc = allFuncs.find(m => !['constructor', 'ListNode', 'TreeNode'].includes(m[1]));
  const funcName = nonClassFunc ? nonClassFunc[1] : (allFuncs[0] ? allFuncs[0][1] : 'solution');

  // Check if this is a tree or linked list problem
  const isTreeProblem = funcName === 'levelOrder' || funcName === 'maxDepth' || funcName === 'invertTree' ||
    funcName === 'isValidBST' || funcName === 'maxPathSum' || funcName === 'lowestCommonAncestor' ||
    code.includes('TreeNode');
  const isLinkedListProblem = funcName === 'reverseList' || funcName === 'mergeTwoLists' ||
    funcName === 'hasCycle' || funcName === 'removeNthFromEnd' || funcName === 'reorderList' ||
    funcName === 'mergeKLists' || code.includes('ListNode');

  return new Promise((resolve) => {
    // Wrap code to handle input, call function, and print result
    const wrappedCode = `
${code}

// Build linked list from array
function buildLinkedList(arr) {
  if (!arr || arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let curr = head;
  for (let i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return head;
}

// Convert linked list to array
function linkedListToArray(head) {
  const result = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}

// Build tree from level-order array
function buildTree(values) {
  if (!values || values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let i = 1;
  while (queue.length > 0 && i < values.length) {
    const node = queue.shift();
    if (i < values.length && values[i] !== null) {
      node.left = new TreeNode(values[i]);
      queue.push(node.left);
    }
    i++;
    if (i < values.length && values[i] !== null) {
      node.right = new TreeNode(values[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

// Convert tree to level-order array
function treeToArray(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

// Find node by value in tree
function findNode(root, val) {
  if (!root) return null;
  if (root.val === val) return root;
  return findNode(root.left, val) || findNode(root.right, val);
}

// Parse inputs
const inputs = ${JSON.stringify(lines)};
let args = inputs.map(inp => {
  inp = inp.trim();
  try {
    // Try to parse as JSON (handles arrays, numbers, etc.)
    return JSON.parse(inp.replace(/null/g, 'null'));
  } catch {
    // If it's a quoted string, remove quotes
    if ((inp.startsWith('"') && inp.endsWith('"')) || (inp.startsWith("'") && inp.endsWith("'"))) {
      return inp.slice(1, -1);
    }
    return inp;
  }
});

${isLinkedListProblem ? `
// Convert array args to ListNode for linked list problems
let originalHead = null;
for (let i = 0; i < args.length; i++) {
  if (Array.isArray(args[i])) {
    // Check if it's an array of arrays (like for mergeKLists)
    if (args[i].length > 0 && Array.isArray(args[i][0])) {
      args[i] = args[i].map(inner => buildLinkedList(inner));
    } else if (args[i].every(x => typeof x === 'number' || x === null)) {
      const converted = buildLinkedList(args[i]);
      if (i === 0) originalHead = converted;
      args[i] = converted;
    }
  }
}
` : ''}

${isTreeProblem ? `
// Convert first array arg to TreeNode for tree problems
let treeRoot = null;
if (args.length > 0 && Array.isArray(args[0])) {
  treeRoot = buildTree(args[0]);
  args[0] = treeRoot;
}

// For LCA, convert p and q values to TreeNode objects
if ('${funcName}' === 'lowestCommonAncestor' && args.length >= 3) {
  if (typeof args[1] === 'number') {
    args[1] = findNode(treeRoot, args[1]);
  }
  if (typeof args[2] === 'number') {
    args[2] = findNode(treeRoot, args[2]);
  }
}
` : ''}

// Call the function
let result = ${funcName}(...args);

${isLinkedListProblem ? `
// Handle in-place modification (reorderList returns undefined)
if ('${funcName}' === 'reorderList' && result === undefined && originalHead !== null) {
  result = originalHead;
}

// Convert linked list result back to array
if (result !== null && result !== undefined && typeof result === 'object' && 'val' in result) {
  result = linkedListToArray(result);
} else if (result === null || result === undefined) {
  result = [];
}
` : ''}

${isTreeProblem ? `
// Convert tree result back to array or extract value
if (result !== null && result !== undefined && typeof result === 'object' && 'val' in result) {
  if ('${funcName}' === 'lowestCommonAncestor') {
    result = result.val;
  } else {
    result = treeToArray(result);
  }
} else if (result === null && '${funcName}' === 'invertTree') {
  result = [];
}
` : ''}

// Print result
if (typeof result === 'boolean') {
  console.log(result.toString().toLowerCase());
} else if (Array.isArray(result)) {
  console.log(JSON.stringify(result).replace(/ /g, ''));
} else {
  console.log(result);
}
`;

    const process = spawn('node', ['-e', wrappedCode], {
      timeout: TIMEOUT_MS,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      process.kill('SIGKILL');
    }, TIMEOUT_MS);

    process.on('close', (code) => {
      clearTimeout(timeout);
      resolve({
        output: stdout.trim(),
        error: stderr.trim(),
        exitCode: code ?? 1,
        timedOut,
      });
    });

    process.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        output: '',
        error: err.message,
        exitCode: 1,
        timedOut: false,
      });
    });
  });
}

/**
 * Execute TypeScript code locally
 */
async function executeTypeScript(code: string, input: string): Promise<LocalExecutionResult> {
  // Parse input lines
  const lines = input.split('\n').filter(l => l.trim());

  // Detect function name - skip constructor and class names
  const allFuncs = [...code.matchAll(/function\s+(\w+)\s*[<(]/g)];
  const nonClassFunc = allFuncs.find(m => !['constructor', 'ListNode', 'TreeNode'].includes(m[1]));
  const funcName = nonClassFunc ? nonClassFunc[1] : (allFuncs[0] ? allFuncs[0][1] : 'solution');

  // Check if this is a tree or linked list problem
  const isTreeProblem = funcName === 'levelOrder' || funcName === 'maxDepth' || funcName === 'invertTree' ||
    funcName === 'isValidBST' || funcName === 'maxPathSum' || funcName === 'lowestCommonAncestor' ||
    code.includes('TreeNode');
  const isLinkedListProblem = funcName === 'reverseList' || funcName === 'mergeTwoLists' ||
    funcName === 'hasCycle' || funcName === 'removeNthFromEnd' || funcName === 'reorderList' ||
    funcName === 'mergeKLists' || code.includes('ListNode');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowcode-ts-'));
  const tsFile = path.join(tempDir, 'solution.ts');

  // Build wrapped TypeScript code
  const wrappedCode = `
${code}

${isLinkedListProblem ? `
// Build linked list from array
function buildLinkedList(arr: number[]): ListNode | null {
  if (!arr || arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let curr: ListNode = head;
  for (let i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return head;
}

// Convert linked list to array
function linkedListToArray(head: ListNode | null): number[] {
  const result: number[] = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}
` : ''}

${isTreeProblem ? `
// Build tree from level-order array
function buildTree(values: (number | null)[]): TreeNode | null {
  if (!values || values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < values.length) {
    const node = queue.shift()!;
    if (i < values.length && values[i] !== null) {
      node.left = new TreeNode(values[i] as number);
      queue.push(node.left);
    }
    i++;
    if (i < values.length && values[i] !== null) {
      node.right = new TreeNode(values[i] as number);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

// Convert tree to level-order array
function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return [];
  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

// Find node by value in tree
function findNode(root: TreeNode | null, val: number): TreeNode | null {
  if (!root) return null;
  if (root.val === val) return root;
  return findNode(root.left, val) || findNode(root.right, val);
}
` : ''}

// Parse inputs
const inputs: string[] = ${JSON.stringify(lines)};
let args: any[] = inputs.map(inp => {
  inp = inp.trim();
  try {
    return JSON.parse(inp.replace(/null/g, 'null'));
  } catch {
    if ((inp.startsWith('"') && inp.endsWith('"')) || (inp.startsWith("'") && inp.endsWith("'"))) {
      return inp.slice(1, -1);
    }
    return inp;
  }
});

${isLinkedListProblem ? `
// Convert array args to ListNode for linked list problems
let originalHead: ListNode | null = null;
for (let i = 0; i < args.length; i++) {
  if (Array.isArray(args[i])) {
    // Check if it's an array of arrays (like for mergeKLists)
    if (args[i].length > 0 && Array.isArray(args[i][0])) {
      args[i] = args[i].map((inner: number[]) => buildLinkedList(inner));
    } else if (args[i].every((x: any) => typeof x === 'number' || x === null)) {
      const converted = buildLinkedList(args[i]);
      if (i === 0) originalHead = converted;
      args[i] = converted;
    }
  }
}
` : ''}

${isTreeProblem ? `
// Convert first array arg to TreeNode for tree problems
let treeRoot: TreeNode | null = null;
if (args.length > 0 && Array.isArray(args[0])) {
  treeRoot = buildTree(args[0]);
  args[0] = treeRoot;
}

${funcName === 'lowestCommonAncestor' ? `
// For LCA, convert p and q values to TreeNode objects
if (args.length >= 3) {
  if (typeof args[1] === 'number') {
    args[1] = findNode(treeRoot, args[1]);
  }
  if (typeof args[2] === 'number') {
    args[2] = findNode(treeRoot, args[2]);
  }
}
` : ''}
` : ''}

// Call the function
let result: any = (${funcName} as any)(...args);

${isLinkedListProblem && funcName === 'reorderList' ? `
// Handle in-place modification (reorderList returns undefined)
if (result === undefined && originalHead !== null) {
  result = originalHead;
}
` : ''}

${isLinkedListProblem ? `
// Convert linked list result back to array
if (result !== null && result !== undefined && typeof result === 'object' && 'val' in result) {
  result = linkedListToArray(result);
} else if (result === null || result === undefined) {
  result = [];
}
` : ''}

${isTreeProblem ? `
// Convert tree result back to array or extract value
if (result !== null && result !== undefined && typeof result === 'object' && 'val' in result) {
  ${funcName === 'lowestCommonAncestor' ? `result = result.val;` : `result = treeToArray(result);`}
} ${funcName === 'invertTree' ? `else if (result === null) { result = []; }` : ''}
` : ''}

// Print result
if (typeof result === 'boolean') {
  console.log(result.toString().toLowerCase());
} else if (Array.isArray(result)) {
  console.log(JSON.stringify(result).replace(/ /g, ''));
} else {
  console.log(result);
}
`;

  fs.writeFileSync(tsFile, wrappedCode);

  // Compile TypeScript to JavaScript
  // Use tsc from the monorepo root's node_modules to avoid npx issues in temp directories
  const tscPath = path.join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'tsc');
  try {
    execSync(`"${tscPath}" --skipLibCheck --esModuleInterop --target ES2020 --module commonjs --outDir "${tempDir}" "${tsFile}"`, {
      timeout: TIMEOUT_MS,
      encoding: 'utf-8',
    });
  } catch (compileError: unknown) {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* ignore */ }
    const error = compileError as { stdout?: string; stderr?: string; message?: string };
    const errorMsg = error.stdout || error.stderr || error.message || 'Unknown error';
    return {
      output: '',
      error: `TypeScript Compilation Error: ${errorMsg}`,
      exitCode: 1,
      timedOut: false,
    };
  }

  const jsFile = path.join(tempDir, 'solution.js');

  // Run the compiled JavaScript
  return new Promise((resolve) => {
    const proc = spawn('node', [jsFile], { timeout: TIMEOUT_MS });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, TIMEOUT_MS);

    const cleanup = () => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* ignore */ }
    };

    proc.on('close', (exitCode) => {
      clearTimeout(timeout);
      cleanup();
      resolve({
        output: stdout.trim(),
        error: stderr.trim(),
        exitCode: exitCode ?? 1,
        timedOut,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      cleanup();
      resolve({ output: '', error: err.message, exitCode: 1, timedOut: false });
    });
  });
}

/**
 * Wrap user's Java code to handle input/output automatically
 */
function wrapJavaCode(userCode: string, input: string): string {
  const lines = input.split('\n').filter(l => l.trim());

  // Try to detect the method name from user code (must have public modifier)
  // Handle nested generics like List<List<Integer>>, ListNode, TreeNode, void
  const methodMatch = userCode.match(/public\s+(?:static\s+)?(?:int\[\]|int|boolean|String|void|ListNode|TreeNode|List<(?:[^<>]|<[^<>]*>)*>)\s+(\w+)\s*\(/);
  const methodName = methodMatch ? methodMatch[1] : 'solution';

  // Detect return type
  const returnTypeMatch = userCode.match(/public\s+(?:static\s+)?(int\[\]|int|boolean|String|void|ListNode|TreeNode|List<(?:[^<>]|<[^<>]*>)*>)\s+\w+\s*\(/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';

  // Find the class that contains this method (not TreeNode or other data classes)
  // Look for "class X {" that comes before the public method
  const classPattern = new RegExp(`class\\s+(\\w+)\\s*\\{[^}]*public\\s+.*${methodName}\\s*\\(`, 's');
  const classMatch = userCode.match(classPattern);
  const className = classMatch ? classMatch[1] : 'Solution';

  // Check if this is a tree or linked list problem
  const isTreeProblem = methodName === 'levelOrder' || methodName === 'maxDepth' || methodName === 'invertTree' ||
    methodName === 'isValidBST' || methodName === 'maxPathSum' || methodName === 'lowestCommonAncestor' ||
    userCode.includes('TreeNode');
  const isLinkedListProblem = methodName === 'reverseList' || methodName === 'mergeTwoLists' ||
    methodName === 'hasCycle' || methodName === 'removeNthFromEnd' || methodName === 'reorderList' ||
    methodName === 'mergeKLists' || userCode.includes('ListNode');

  // Build wrapper that creates instance and calls method
  const wrapper = `
import java.util.*;
import java.util.stream.*;

${userCode}

class Main {
    public static void main(String[] args) {
        String[] inputs = new String[] {${lines.map(l => JSON.stringify(l)).join(', ')}};
        Object[] parsedArgs = new Object[inputs.length];

        ${methodName === 'groupAnagrams' ? '' : `for (int i = 0; i < inputs.length; i++) {
            String inp = inputs[i].trim();
            parsedArgs[i] = parseInput(inp);
        }`}

        ${className} sol = new ${className}();
        ${getJavaMethodCall(methodName, returnType, lines.length)}
    }

    static Object parseInput(String inp) {
        inp = inp.trim();
        // Parse arrays like [1,2,3]
        if (inp.startsWith("[") && inp.endsWith("]")) {
            String inner = inp.substring(1, inp.length() - 1).trim();
            if (inner.isEmpty()) return new int[0];
            // Check if nested array
            if (inner.startsWith("[")) {
                // Nested array - not fully supported yet
                return inner;
            }
            // Check if contains "null" - return as string for tree problems
            if (inner.contains("null")) {
                return inp;
            }
            String[] parts = inner.split(",");
            int[] arr = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                arr[i] = Integer.parseInt(parts[i].trim());
            }
            return arr;
        }
        // Parse quoted strings
        if ((inp.startsWith("\\"") && inp.endsWith("\\"")) || (inp.startsWith("'") && inp.endsWith("'"))) {
            return inp.substring(1, inp.length() - 1);
        }
        // Try to parse as integer
        try {
            return Integer.parseInt(inp);
        } catch (Exception e) {
            return inp;
        }
    }

    static void printResult(Object result) {
        if (result instanceof int[]) {
            int[] arr = (int[]) result;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {
                System.out.print(arr[i]);
                if (i < arr.length - 1) System.out.print(",");
            }
            System.out.println("]");
        } else if (result instanceof List) {
            System.out.println(result.toString().replace(" ", ""));
        } else if (result instanceof Boolean) {
            System.out.println(result.toString().toLowerCase());
        } else {
            System.out.println(result);
        }
    }
${isTreeProblem ? `
    // Build tree from level-order serialization like [3,9,20,null,null,15,7]
    static TreeNode buildTree(String s) {
        s = s.trim();
        if (s.equals("[]") || s.isEmpty()) return null;

        String inner = s.substring(1, s.length() - 1);
        String[] parts = inner.split(",");
        if (parts.length == 0 || parts[0].trim().equals("null")) return null;

        TreeNode root = new TreeNode(Integer.parseInt(parts[0].trim()));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        int i = 1;
        while (!queue.isEmpty() && i < parts.length) {
            TreeNode node = queue.poll();

            // Left child
            if (i < parts.length && !parts[i].trim().equals("null")) {
                node.left = new TreeNode(Integer.parseInt(parts[i].trim()));
                queue.offer(node.left);
            }
            i++;

            // Right child
            if (i < parts.length && !parts[i].trim().equals("null")) {
                node.right = new TreeNode(Integer.parseInt(parts[i].trim()));
                queue.offer(node.right);
            }
            i++;
        }

        return root;
    }

    // Print nested list for tree level order output
    static void printNestedList(List<List<Integer>> result) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.size(); i++) {
            sb.append("[");
            List<Integer> level = result.get(i);
            for (int j = 0; j < level.size(); j++) {
                sb.append(level.get(j));
                if (j < level.size() - 1) sb.append(",");
            }
            sb.append("]");
            if (i < result.size() - 1) sb.append(",");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }

    // Tree to array conversion
    static String treeToArray(TreeNode root) {
        if (root == null) return "[]";
        List<String> result = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node != null) {
                result.add(String.valueOf(node.val));
                queue.offer(node.left);
                queue.offer(node.right);
            } else {
                result.add("null");
            }
        }
        // Remove trailing nulls
        while (result.size() > 0 && result.get(result.size() - 1).equals("null")) {
            result.remove(result.size() - 1);
        }
        return "[" + String.join(",", result) + "]";
    }

    // Find node by value in tree
    static TreeNode findNode(TreeNode root, int val) {
        if (root == null) return null;
        if (root.val == val) return root;
        TreeNode left = findNode(root.left, val);
        if (left != null) return left;
        return findNode(root.right, val);
    }
` : ''}
${isLinkedListProblem ? `
    // Build linked list from array
    static ListNode buildLinkedList(int[] arr) {
        if (arr == null || arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }

    // Convert linked list to array string
    static String linkedListToString(ListNode head) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(",");
            head = head.next;
        }
        sb.append("]");
        return sb.toString();
    }

    // Build array of linked lists for mergeKLists
    static ListNode[] buildLinkedListArray(String input) {
        input = input.trim();
        if (input.equals("[]")) return new ListNode[0];
        // Parse [[1,4,5],[1,3,4],[2,6]] format
        List<ListNode> lists = new ArrayList<>();
        int depth = 0;
        int start = 0;
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (c == '[') {
                if (depth == 1) start = i;
                depth++;
            } else if (c == ']') {
                depth--;
                if (depth == 1) {
                    String inner = input.substring(start + 1, i);
                    if (inner.isEmpty()) {
                        lists.add(null);
                    } else {
                        String[] parts = inner.split(",");
                        int[] arr = new int[parts.length];
                        for (int j = 0; j < parts.length; j++) {
                            arr[j] = Integer.parseInt(parts[j].trim());
                        }
                        lists.add(buildLinkedList(arr));
                    }
                }
            }
        }
        return lists.toArray(new ListNode[0]);
    }
` : ''}
}
`;
  return wrapper;
}

function getJavaMethodCall(methodName: string, returnType: string, argCount: number): string {
  // Trees: TreeNode -> List<List<Integer>>
  if (methodName === 'levelOrder') {
    return `TreeNode root = buildTree(inputs[0]);
        List<List<Integer>> result = sol.levelOrder(root);
        printNestedList(result);`;
  }

  // Trees: TreeNode -> int
  if (methodName === 'maxDepth' || methodName === 'maxPathSum') {
    return `TreeNode root = buildTree(inputs[0]);
        int result = sol.${methodName}(root);
        System.out.println(result);`;
  }

  // Trees: TreeNode -> boolean
  if (methodName === 'isValidBST') {
    return `TreeNode root = buildTree(inputs[0]);
        boolean result = sol.${methodName}(root);
        printResult(result);`;
  }

  // Trees: TreeNode -> TreeNode (invert)
  if (methodName === 'invertTree') {
    return `TreeNode root = buildTree(inputs[0]);
        TreeNode result = sol.invertTree(root);
        System.out.println(treeToArray(result));`;
  }

  // Trees: TreeNode, TreeNode, TreeNode -> TreeNode (LCA)
  if (methodName === 'lowestCommonAncestor') {
    return `TreeNode root = buildTree(inputs[0]);
        int pVal = Integer.parseInt(inputs[1].trim());
        int qVal = Integer.parseInt(inputs[2].trim());
        TreeNode p = findNode(root, pVal);
        TreeNode q = findNode(root, qVal);
        TreeNode result = sol.lowestCommonAncestor(root, p, q);
        System.out.println(result != null ? result.val : "null");`;
  }

  // Linked Lists: ListNode -> ListNode (reverse)
  if (methodName === 'reverseList') {
    return `ListNode head = buildLinkedList((int[]) parsedArgs[0]);
        ListNode result = sol.reverseList(head);
        System.out.println(linkedListToString(result));`;
  }

  // Linked Lists: ListNode, ListNode -> ListNode (merge two)
  if (methodName === 'mergeTwoLists') {
    return `ListNode list1 = buildLinkedList((int[]) parsedArgs[0]);
        ListNode list2 = buildLinkedList((int[]) parsedArgs[1]);
        ListNode result = sol.mergeTwoLists(list1, list2);
        System.out.println(linkedListToString(result));`;
  }

  // Linked Lists: ListNode -> boolean (cycle)
  if (methodName === 'hasCycle') {
    return `ListNode head = buildLinkedList((int[]) parsedArgs[0]);
        boolean result = sol.hasCycle(head);
        printResult(result);`;
  }

  // Linked Lists: ListNode, int -> ListNode (remove nth)
  if (methodName === 'removeNthFromEnd') {
    return `ListNode head = buildLinkedList((int[]) parsedArgs[0]);
        int n = (int) parsedArgs[1];
        ListNode result = sol.removeNthFromEnd(head, n);
        System.out.println(linkedListToString(result));`;
  }

  // Linked Lists: ListNode -> void (reorder - in-place)
  if (methodName === 'reorderList') {
    return `ListNode head = buildLinkedList((int[]) parsedArgs[0]);
        sol.reorderList(head);
        System.out.println(linkedListToString(head));`;
  }

  // Linked Lists: ListNode[] -> ListNode (merge k)
  if (methodName === 'mergeKLists') {
    return `ListNode[] lists = buildLinkedListArray(inputs[0]);
        ListNode result = sol.mergeKLists(lists);
        System.out.println(linkedListToString(result));`;
  }

  // Strings: String[] -> List<List<String>> (group anagrams)
  if (methodName === 'groupAnagrams') {
    return `String input = inputs[0].trim();
        List<String> strList = new ArrayList<>();
        // Parse ["eat","tea","tan","ate","nat","bat"] format
        StringBuilder current = new StringBuilder();
        boolean inQuote = false;
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (c == '"') {
                if (inQuote) {
                    strList.add(current.toString());
                    current = new StringBuilder();
                }
                inQuote = !inQuote;
            } else if (inQuote) {
                current.append(c);
            }
        }
        String[] strs = strList.toArray(new String[0]);
        List<List<String>> result = sol.groupAnagrams(strs);
        // Sort for consistent output
        for (List<String> group : result) Collections.sort(group);
        result.sort((a, b) -> a.get(0).compareTo(b.get(0)));
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < result.size(); i++) {
            sb.append("[");
            List<String> group = result.get(i);
            for (int j = 0; j < group.size(); j++) {
                sb.append("\\"").append(group.get(j)).append("\\"");
                if (j < group.size() - 1) sb.append(",");
            }
            sb.append("]");
            if (i < result.size() - 1) sb.append(",");
        }
        sb.append("]");
        System.out.println(sb.toString());`;
  }

  // Arrays: int[] + int -> int[]
  if (methodName === 'twoSum') {
    return `Object result = sol.twoSum((int[]) parsedArgs[0], (int) parsedArgs[1]);
        printResult(result);`;
  }

  // Arrays: int[] -> int
  if (methodName === 'maxProfit' || methodName === 'maxArea' ||
      methodName === 'maxSubArray' || methodName === 'trap' ||
      methodName === 'longestConsecutive') {
    return `Object result = sol.${methodName}((int[]) parsedArgs[0]);
        printResult(result);`;
  }

  // Arrays: int[] -> int[]
  if (methodName === 'productExceptSelf') {
    return `Object result = sol.${methodName}((int[]) parsedArgs[0]);
        printResult(result);`;
  }

  // Arrays: int[] -> boolean
  if (methodName === 'containsDuplicate') {
    return `Object result = sol.${methodName}((int[]) parsedArgs[0]);
        printResult(result);`;
  }

  // Arrays: int[] + int -> int
  if (methodName === 'subarraySum') {
    return `Object result = sol.${methodName}((int[]) parsedArgs[0], (int) parsedArgs[1]);
        printResult(result);`;
  }

  // Arrays: int[] + int -> int[]
  if (methodName === 'topKFrequent') {
    return `Object result = sol.${methodName}((int[]) parsedArgs[0], (int) parsedArgs[1]);
        printResult(result);`;
  }

  // Strings: String -> boolean
  if (methodName === 'isPalindrome' || methodName === 'isValid') {
    return `Object result = sol.${methodName}((String) parsedArgs[0]);
        printResult(result);`;
  }

  // Strings: String, String -> boolean
  if (methodName === 'isAnagram' || methodName === 'canConstruct') {
    return `Object result = sol.${methodName}((String) parsedArgs[0], (String) parsedArgs[1]);
        printResult(result);`;
  }

  // Strings: String -> int
  if (methodName === 'lengthOfLongestSubstring' || methodName === 'myAtoi') {
    return `Object result = sol.${methodName}((String) parsedArgs[0]);
        printResult(result);`;
  }

  // Strings: String -> String
  if (methodName === 'longestPalindrome') {
    return `Object result = sol.${methodName}((String) parsedArgs[0]);
        printResult(result);`;
  }

  // Strings: String, String -> String
  if (methodName === 'minWindow') {
    return `Object result = sol.${methodName}((String) parsedArgs[0], (String) parsedArgs[1]);
        printResult(result);`;
  }

  // Misc: int -> int
  if (methodName === 'climbStairs') {
    return `Object result = sol.${methodName}((int) parsedArgs[0]);
        printResult(result);`;
  }

  // Generic fallback - try to cast based on return type
  const args: string[] = [];
  for (let i = 0; i < argCount; i++) {
    args.push(`parsedArgs[${i}]`);
  }

  return `Object result = sol.${methodName}(${args.join(', ')});
        printResult(result);`;
}

/**
 * Execute Java code locally
 */
async function executeJava(code: string, input: string): Promise<LocalExecutionResult> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowcode-java-'));
  const wrappedCode = wrapJavaCode(code, input);
  const mainFile = path.join(tempDir, 'Main.java');

  // Write files
  fs.writeFileSync(mainFile, wrappedCode);

  // Compile
  try {
    execSync(`javac ${mainFile}`, {
      cwd: tempDir,
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (compileError: unknown) {
    // Cleanup on compile error
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* ignore */ }
    const error = compileError as { stderr?: Buffer; message?: string };
    return {
      output: '',
      error: `Compilation Error: ${error.stderr?.toString() || error.message || 'Unknown error'}`,
      exitCode: 1,
      timedOut: false,
    };
  }

  // Run
  return new Promise((resolve) => {
    const proc = spawn('java', ['-cp', tempDir, 'Main'], {
      timeout: TIMEOUT_MS,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, TIMEOUT_MS);

    const cleanup = () => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* ignore */ }
    };

    proc.on('close', (exitCode) => {
      clearTimeout(timeout);
      cleanup();
      resolve({
        output: stdout.trim(),
        error: stderr.trim(),
        exitCode: exitCode ?? 1,
        timedOut,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      cleanup();
      resolve({ output: '', error: err.message, exitCode: 1, timedOut: false });
    });
  });
}

/**
 * Wrap user's C++ code to handle input/output automatically
 */
function wrapCppCode(userCode: string, input: string): string {
  const lines = input.split('\n').filter(l => l.trim());

  // Try to detect the class name from user code
  const classMatch = userCode.match(/class\s+(\w+)\s*\{/);
  const className = classMatch ? classMatch[1] : 'Solution';

  // Try to detect the method name (handle nested templates like vector<vector<int>>)
  // Pattern handles: vector<vector<int>>, vector<int>, int, bool, string, ListNode*, TreeNode*, void
  const methodMatch = userCode.match(/(?:vector<(?:[^<>]|<[^<>]*>)*>|int|bool|string|void|ListNode\*?|TreeNode\*?)\s+(\w+)\s*\(/);
  const methodName = methodMatch ? methodMatch[1] : 'solution';

  // Check if this is a tree or linked list problem
  const isTreeProblem = methodName === 'levelOrder' || methodName === 'maxDepth' || methodName === 'invertTree' ||
    methodName === 'isValidBST' || methodName === 'maxPathSum' || methodName === 'lowestCommonAncestor' ||
    userCode.includes('TreeNode');
  const isLinkedListProblem = methodName === 'reverseList' || methodName === 'mergeTwoLists' ||
    methodName === 'hasCycle' || methodName === 'removeNthFromEnd' || methodName === 'reorderList' ||
    methodName === 'mergeKLists' || userCode.includes('ListNode');

  const wrapper = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
using namespace std;

${userCode}

vector<int> parseIntArray(const string& s) {
    vector<int> result;
    string inner = s.substr(1, s.length() - 2);
    if (inner.empty()) return result;
    stringstream ss(inner);
    string item;
    while (getline(ss, item, ',')) {
        result.push_back(stoi(item));
    }
    return result;
}

string parseString(const string& s) {
    if ((s[0] == '"' && s[s.length()-1] == '"') || (s[0] == '\\'' && s[s.length()-1] == '\\'')) {
        return s.substr(1, s.length() - 2);
    }
    return s;
}

template<typename T>
void printVector(const vector<T>& v) {
    cout << "[";
    for (size_t i = 0; i < v.size(); i++) {
        cout << v[i];
        if (i < v.size() - 1) cout << ",";
    }
    cout << "]" << endl;
}

void printBool(bool b) {
    cout << (b ? "true" : "false") << endl;
}

${isTreeProblem ? `
// Parse tree node values from serialized format [3,9,20,null,null,15,7]
vector<string> parseTreeArray(const string& s) {
    vector<string> result;
    string inner = s.substr(1, s.length() - 2);
    if (inner.empty()) return result;
    stringstream ss(inner);
    string item;
    while (getline(ss, item, ',')) {
        // Trim whitespace
        size_t start = item.find_first_not_of(" ");
        size_t end = item.find_last_not_of(" ");
        if (start != string::npos) {
            result.push_back(item.substr(start, end - start + 1));
        }
    }
    return result;
}

// Build tree from level-order serialization
TreeNode* buildTree(const string& s) {
    vector<string> values = parseTreeArray(s);
    if (values.empty() || values[0] == "null") return nullptr;

    TreeNode* root = new TreeNode(stoi(values[0]));
    queue<TreeNode*> q;
    q.push(root);

    int i = 1;
    while (!q.empty() && i < values.size()) {
        TreeNode* node = q.front();
        q.pop();

        // Left child
        if (i < values.size() && values[i] != "null") {
            node->left = new TreeNode(stoi(values[i]));
            q.push(node->left);
        }
        i++;

        // Right child
        if (i < values.size() && values[i] != "null") {
            node->right = new TreeNode(stoi(values[i]));
            q.push(node->right);
        }
        i++;
    }

    return root;
}

// Print nested vector (for tree level order output)
void printNestedVector(const vector<vector<int>>& v) {
    cout << "[";
    for (size_t i = 0; i < v.size(); i++) {
        cout << "[";
        for (size_t j = 0; j < v[i].size(); j++) {
            cout << v[i][j];
            if (j < v[i].size() - 1) cout << ",";
        }
        cout << "]";
        if (i < v.size() - 1) cout << ",";
    }
    cout << "]" << endl;
}

// Find a node by value in the tree
TreeNode* findNode(TreeNode* root, int val) {
    if (!root) return nullptr;
    if (root->val == val) return root;
    TreeNode* left = findNode(root->left, val);
    if (left) return left;
    return findNode(root->right, val);
}

// Convert tree to array string
string treeToString(TreeNode* root) {
    if (!root) return "[]";
    string result = "[";
    queue<TreeNode*> q;
    q.push(root);
    vector<string> values;
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        if (node) {
            values.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            values.push_back("null");
        }
    }
    // Remove trailing nulls
    while (!values.empty() && values.back() == "null") {
        values.pop_back();
    }
    for (size_t i = 0; i < values.size(); i++) {
        result += values[i];
        if (i < values.size() - 1) result += ",";
    }
    result += "]";
    return result;
}
` : ''}
${isLinkedListProblem ? `
// Build linked list from array
ListNode* buildLinkedList(const vector<int>& arr) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < arr.size(); i++) {
        curr->next = new ListNode(arr[i]);
        curr = curr->next;
    }
    return head;
}

// Print linked list as array
void printLinkedList(ListNode* head) {
    cout << "[";
    while (head) {
        cout << head->val;
        if (head->next) cout << ",";
        head = head->next;
    }
    cout << "]" << endl;
}

// Build array of linked lists
vector<ListNode*> buildLinkedListArray(const string& s) {
    vector<ListNode*> result;
    if (s == "[]") return result;
    string inner = s.substr(1, s.length() - 2);
    int depth = 0;
    string current;
    for (char c : inner) {
        if (c == '[') {
            depth++;
            if (depth > 1) current += c;
        } else if (c == ']') {
            depth--;
            if (depth >= 1) current += c;
            else if (depth == 0) {
                if (!current.empty()) {
                    result.push_back(buildLinkedList(parseIntArray("[" + current + "]")));
                }
                current = "";
            }
        } else if (c == ',' && depth == 0) {
            // Skip comma between arrays (at depth 0)
        } else {
            current += c;
        }
    }
    return result;
}
` : ''}

int main() {
    ${className} sol;
    ${getCppMethodCall(methodName, lines)}
    return 0;
}
`;
  return wrapper;
}

function getCppMethodCall(methodName: string, inputLines: string[]): string {
  // Generate appropriate call based on method name
  const escapedInputs = inputLines.map(l => l.replace(/\\/g, '\\\\').replace(/"/g, '\\"'));

  // Arrays: vector<int> + int -> vector<int>
  if (methodName === 'twoSum') {
    return `
    vector<int> nums = parseIntArray("${escapedInputs[0]}");
    int target = stoi("${escapedInputs[1]}");
    auto result = sol.twoSum(nums, target);
    printVector(result);`;
  }

  // Arrays: vector<int> -> int
  if (methodName === 'maxProfit' || methodName === 'maxArea' ||
      methodName === 'maxSubArray' || methodName === 'trap' ||
      methodName === 'longestConsecutive') {
    return `
    vector<int> arr = parseIntArray("${escapedInputs[0]}");
    int result = sol.${methodName}(arr);
    cout << result << endl;`;
  }

  // Arrays: vector<int> -> vector<int>
  if (methodName === 'productExceptSelf') {
    return `
    vector<int> nums = parseIntArray("${escapedInputs[0]}");
    auto result = sol.${methodName}(nums);
    printVector(result);`;
  }

  // Arrays: vector<int> -> bool
  if (methodName === 'containsDuplicate') {
    return `
    vector<int> nums = parseIntArray("${escapedInputs[0]}");
    bool result = sol.${methodName}(nums);
    printBool(result);`;
  }

  // Arrays: vector<int> + int -> int
  if (methodName === 'subarraySum') {
    return `
    vector<int> nums = parseIntArray("${escapedInputs[0]}");
    int k = stoi("${escapedInputs[1]}");
    int result = sol.${methodName}(nums, k);
    cout << result << endl;`;
  }

  // Arrays: vector<int> + int -> vector<int>
  if (methodName === 'topKFrequent') {
    return `
    vector<int> nums = parseIntArray("${escapedInputs[0]}");
    int k = stoi("${escapedInputs[1]}");
    auto result = sol.${methodName}(nums, k);
    printVector(result);`;
  }

  // Strings: string -> bool
  if (methodName === 'isPalindrome' || methodName === 'isValid') {
    return `
    string s = parseString("${escapedInputs[0]}");
    bool result = sol.${methodName}(s);
    printBool(result);`;
  }

  // Strings: string, string -> bool
  if (methodName === 'isAnagram' || methodName === 'canConstruct') {
    return `
    string s = parseString("${escapedInputs[0]}");
    string t = parseString("${escapedInputs[1]}");
    bool result = sol.${methodName}(s, t);
    printBool(result);`;
  }

  // Strings: string -> int
  if (methodName === 'lengthOfLongestSubstring' || methodName === 'myAtoi') {
    return `
    string s = parseString("${escapedInputs[0]}");
    int result = sol.${methodName}(s);
    cout << result << endl;`;
  }

  // Strings: string -> string
  if (methodName === 'longestPalindrome') {
    return `
    string s = parseString("${escapedInputs[0]}");
    string result = sol.${methodName}(s);
    cout << result << endl;`;
  }

  // Strings: string, string -> string
  if (methodName === 'minWindow') {
    return `
    string s = parseString("${escapedInputs[0]}");
    string t = parseString("${escapedInputs[1]}");
    string result = sol.${methodName}(s, t);
    cout << result << endl;`;
  }

  // Misc: int -> int
  if (methodName === 'climbStairs') {
    return `
    int n = stoi("${escapedInputs[0]}");
    int result = sol.${methodName}(n);
    cout << result << endl;`;
  }

  // Trees: TreeNode* -> vector<vector<int>>
  if (methodName === 'levelOrder') {
    return `
    TreeNode* root = buildTree("${escapedInputs[0]}");
    auto result = sol.levelOrder(root);
    printNestedVector(result);`;
  }

  // Trees: TreeNode* -> int
  if (methodName === 'maxDepth' || methodName === 'maxPathSum') {
    return `
    TreeNode* root = buildTree("${escapedInputs[0]}");
    int result = sol.${methodName}(root);
    cout << result << endl;`;
  }

  // Trees: TreeNode* -> bool
  if (methodName === 'isValidBST') {
    return `
    TreeNode* root = buildTree("${escapedInputs[0]}");
    bool result = sol.${methodName}(root);
    printBool(result);`;
  }

  // Trees: LCA - TreeNode*, TreeNode*, TreeNode* -> TreeNode*
  if (methodName === 'lowestCommonAncestor') {
    return `
    TreeNode* root = buildTree("${escapedInputs[0]}");
    int pVal = ${escapedInputs[1] || '0'};
    int qVal = ${escapedInputs[2] || '0'};
    TreeNode* p = findNode(root, pVal);
    TreeNode* q = findNode(root, qVal);
    TreeNode* result = sol.${methodName}(root, p, q);
    cout << (result ? result->val : -1) << endl;`;
  }

  // Trees: TreeNode* -> TreeNode* (invert)
  if (methodName === 'invertTree') {
    return `
    TreeNode* root = buildTree("${escapedInputs[0]}");
    TreeNode* result = sol.invertTree(root);
    cout << treeToString(result) << endl;`;
  }

  // Linked Lists: ListNode* -> ListNode* (reverse)
  if (methodName === 'reverseList') {
    return `
    vector<int> arr = parseIntArray("${escapedInputs[0]}");
    ListNode* head = buildLinkedList(arr);
    ListNode* result = sol.reverseList(head);
    printLinkedList(result);`;
  }

  // Linked Lists: ListNode*, ListNode* -> ListNode* (merge two)
  if (methodName === 'mergeTwoLists') {
    return `
    vector<int> arr1 = parseIntArray("${escapedInputs[0]}");
    vector<int> arr2 = parseIntArray("${escapedInputs[1]}");
    ListNode* list1 = buildLinkedList(arr1);
    ListNode* list2 = buildLinkedList(arr2);
    ListNode* result = sol.mergeTwoLists(list1, list2);
    printLinkedList(result);`;
  }

  // Linked Lists: ListNode* -> bool (cycle)
  if (methodName === 'hasCycle') {
    return `
    vector<int> arr = parseIntArray("${escapedInputs[0]}");
    ListNode* head = buildLinkedList(arr);
    bool result = sol.hasCycle(head);
    printBool(result);`;
  }

  // Linked Lists: ListNode*, int -> ListNode* (remove nth)
  if (methodName === 'removeNthFromEnd') {
    return `
    vector<int> arr = parseIntArray("${escapedInputs[0]}");
    int n = stoi("${escapedInputs[1]}");
    ListNode* head = buildLinkedList(arr);
    ListNode* result = sol.removeNthFromEnd(head, n);
    printLinkedList(result);`;
  }

  // Linked Lists: ListNode* -> void (reorder - in-place)
  if (methodName === 'reorderList') {
    return `
    vector<int> arr = parseIntArray("${escapedInputs[0]}");
    ListNode* head = buildLinkedList(arr);
    sol.reorderList(head);
    printLinkedList(head);`;
  }

  // Linked Lists: vector<ListNode*> -> ListNode* (merge k)
  if (methodName === 'mergeKLists') {
    return `
    vector<ListNode*> lists = buildLinkedListArray("${escapedInputs[0]}");
    ListNode* result = sol.mergeKLists(lists);
    printLinkedList(result);`;
  }

  // Strings: vector<string> -> vector<vector<string>> (group anagrams)
  if (methodName === 'groupAnagrams') {
    return `
    // Parse string array
    string input = "${escapedInputs[0]}";
    vector<string> strs;
    string current;
    bool inQuote = false;
    for (char c : input) {
        if (c == '"') {
            if (inQuote) {
                strs.push_back(current);
                current = "";
            }
            inQuote = !inQuote;
        } else if (inQuote) {
            current += c;
        }
    }
    auto result = sol.groupAnagrams(strs);
    // Sort for consistent output
    for (auto& group : result) sort(group.begin(), group.end());
    sort(result.begin(), result.end());
    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        cout << "[";
        for (size_t j = 0; j < result[i].size(); j++) {
            cout << "\\"" << result[i][j] << "\\"";
            if (j < result[i].size() - 1) cout << ",";
        }
        cout << "]";
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;`;
  }

  // Generic fallback
  return `
    // Unsupported method: ${methodName}
    cout << "Method not supported" << endl;`;
}

/**
 * Execute C++ code locally
 */
async function executeCpp(code: string, input: string): Promise<LocalExecutionResult> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowcode-cpp-'));
  const wrappedCode = wrapCppCode(code, input);
  const sourceFile = path.join(tempDir, 'solution.cpp');
  const execFile = path.join(tempDir, 'solution');

  fs.writeFileSync(sourceFile, wrappedCode);

  // Compile with g++
  try {
    execSync(`g++ -std=c++17 -o ${execFile} ${sourceFile}`, {
      cwd: tempDir,
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (compileError: unknown) {
    // Cleanup on compile error
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* ignore */ }
    const error = compileError as { stderr?: Buffer; message?: string };
    return {
      output: '',
      error: `Compilation Error: ${error.stderr?.toString() || error.message || 'Unknown error'}`,
      exitCode: 1,
      timedOut: false,
    };
  }

  // Run
  return new Promise((resolve) => {
    const proc = spawn(execFile, [], { timeout: TIMEOUT_MS });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, TIMEOUT_MS);

    const cleanup = () => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* ignore */ }
    };

    proc.on('close', (exitCode) => {
      clearTimeout(timeout);
      cleanup();
      resolve({
        output: stdout.trim(),
        error: stderr.trim(),
        exitCode: exitCode ?? 1,
        timedOut,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      cleanup();
      resolve({ output: '', error: err.message, exitCode: 1, timedOut: false });
    });
  });
}

/**
 * Run code against test cases locally
 */
export async function runCodeLocally(
  code: string,
  language: string,
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[]
): Promise<{
  testCaseResults: TestCaseResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  const results: TestCaseResult[] = [];
  let passedCount = 0;

  // Supported languages
  const supportedLanguages = ['python', 'javascript', 'typescript', 'java', 'cpp'];
  if (!supportedLanguages.includes(language)) {
    return {
      testCaseResults: testCases.map((tc, idx) => ({
        testCaseIndex: idx,
        passed: false,
        expectedOutput: tc.isHidden ? undefined : tc.expectedOutput,
        actualOutput: undefined,
        executionTime: 0,
        memoryUsed: 0,
        error: `Language '${language}' not supported for local execution. Supported: ${supportedLanguages.join(', ')}.`,
      })),
      totalTestCases: testCases.length,
      passedTestCases: 0,
      executionTime: Date.now() - startTime,
      error: `Language '${language}' not supported`,
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const tcStartTime = Date.now();

    let result: LocalExecutionResult;
    if (language === 'python') {
      result = await executePython(code, testCase.input);
    } else if (language === 'javascript') {
      result = await executeJavaScript(code, testCase.input);
    } else if (language === 'typescript') {
      result = await executeTypeScript(code, testCase.input);
    } else if (language === 'java') {
      result = await executeJava(code, testCase.input);
    } else if (language === 'cpp') {
      result = await executeCpp(code, testCase.input);
    } else {
      result = { output: '', error: 'Unsupported language', exitCode: 1, timedOut: false };
    }

    const tcTime = Date.now() - tcStartTime;

    // Normalize outputs for comparison (trim whitespace, normalize line endings)
    const normalizedActual = result.output.replace(/\r\n/g, '\n').trim();
    const normalizedExpected = testCase.expectedOutput.replace(/\r\n/g, '\n').trim();

    // For certain problem types, we need flexible comparison
    let passed = false;
    if (!result.error && !result.timedOut) {
      if (normalizedActual === normalizedExpected) {
        passed = true;
      } else {
        // Try to parse as JSON and compare as unordered arrays (for groupAnagrams-type problems)
        try {
          const actualParsed = JSON.parse(normalizedActual);
          const expectedParsed = JSON.parse(normalizedExpected);
          if (Array.isArray(actualParsed) && Array.isArray(expectedParsed)) {
            // Check if it's a nested array (like group anagrams output)
            if (actualParsed.length > 0 && Array.isArray(actualParsed[0])) {
              // Sort inner arrays and then sort outer array by stringified inner arrays
              const sortNested = (arr: any[][]) => {
                const sorted = arr.map(inner => [...inner].sort());
                sorted.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
                return JSON.stringify(sorted);
              };
              passed = sortNested(actualParsed) === sortNested(expectedParsed);
            } else {
              // Simple array - sort and compare
              passed = JSON.stringify([...actualParsed].sort()) === JSON.stringify([...expectedParsed].sort());
            }
          }
        } catch {
          // If JSON parsing fails, check for valid palindrome alternative answers
          // For longestPalindrome, both "bab" and "aba" are valid for "babad"
          if (normalizedActual.length === normalizedExpected.length) {
            const isPalindrome = (s: string) => s === s.split('').reverse().join('');
            if (isPalindrome(normalizedActual) && isPalindrome(normalizedExpected)) {
              passed = true;
            }
          }
        }
      }
    }

    if (passed) {
      passedCount++;
    }

    // Shorten input for display (max 50 chars)
    const shortInput = testCase.input.length > 50
      ? testCase.input.substring(0, 50) + '...'
      : testCase.input;

    results.push({
      testCaseIndex: i,
      passed,
      input: testCase.isHidden ? undefined : shortInput.replace(/\n/g, ', '),
      expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput,
      actualOutput: testCase.isHidden ? undefined : result.output,
      executionTime: tcTime,
      memoryUsed: 0, // Can't easily measure memory locally
      error: result.timedOut
        ? 'Time Limit Exceeded (5s)'
        : result.error || undefined,
    });
  }

  return {
    testCaseResults: results,
    totalTestCases: testCases.length,
    passedTestCases: passedCount,
    executionTime: Date.now() - startTime,
  };
}
