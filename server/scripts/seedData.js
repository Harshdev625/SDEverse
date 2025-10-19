const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const slugify = require("slugify");

// Import models
const User = require("../models/user.model");
const Algorithm = require("../models/algorithm.model");
const DataStructure = require("../models/dataStructure.model");

dotenv.config();

// Sample users
const sampleUsers = [
  {
    username: "admin",
    email: "admin@sdeverse.com",
    password: "admin123",
    fullName: "Admin User",
    bio: "Platform administrator and algorithm enthusiast",
    role: "admin",
  },
  {
    username: "alice_dev",
    email: "alice@example.com",
    password: "password123",
    fullName: "Alice Johnson",
    bio: "Software engineer passionate about algorithms and data structures",
    role: "user",
  },
  {
    username: "bob_coder",
    email: "bob@example.com",
    password: "password123",
    fullName: "Bob Smith",
    bio: "Computer science student and competitive programmer",
    role: "user",
  },
  {
    username: "charlie_tech",
    email: "charlie@example.com",
    password: "password123",
    fullName: "Charlie Brown",
    bio: "Senior developer with expertise in system design",
    role: "user",
  },
];

// Sample algorithms
const sampleAlgorithms = [
  {
    title: "Binary Search",
    problemStatement: "Find the position of a target value in a sorted array. If the target is not found, return -1.",
    category: ["Searching", "Binary Search", "Array"],
    difficulty: "Easy",
    intuition: "Binary search works by repeatedly dividing the search interval in half. If the target value is less than the middle element, search the left half; otherwise, search the right half.",
    explanation: "Binary search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
    complexity: {
      time: "O(log n)",
      space: "O(1)",
    },
    tags: ["fundamental", "interview", "leetcode"],
    codes: [
      {
        language: "Python",
        code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example usage
arr = [1, 3, 5, 7, 9, 11, 13]
target = 7
result = binary_search(arr, target)
print(f"Target {target} found at index: {result}")`,
      },
      {
        language: "JavaScript",
        code: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// Example usage
const arr = [1, 3, 5, 7, 9, 11, 13];
const target = 7;
const result = binarySearch(arr, target);
console.log(\`Target \${target} found at index: \${result}\`);`,
      },
    ],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Quick Sort",
    problemStatement: "Sort an array of integers in ascending order using the quicksort algorithm.",
    category: ["Sorting", "Divide and Conquer", "Array"],
    difficulty: "Medium",
    intuition: "Quicksort uses a divide-and-conquer approach. It picks a 'pivot' element and partitions the array around it, then recursively sorts the sub-arrays.",
    explanation: "Quicksort is an efficient sorting algorithm that works by selecting a 'pivot' element from the array and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot.",
    complexity: {
      time: "O(n log n) average, O(n²) worst case",
      space: "O(log n)",
    },
    tags: ["sorting", "recursion", "interview"],
    codes: [
      {
        language: "Python",
        code: `def quicksort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        # Partition the array and get pivot index
        pivot_index = partition(arr, low, high)
        
        # Recursively sort elements before and after partition
        quicksort(arr, low, pivot_index - 1)
        quicksort(arr, pivot_index + 1, high)
    
    return arr

def partition(arr, low, high):
    # Choose the rightmost element as pivot
    pivot = arr[high]
    
    # Index of smaller element
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# Example usage
arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = quicksort(arr.copy())
print("Sorted array:", sorted_arr)`,
      },
    ],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Merge Sort",
    problemStatement: "Sort an array using the divide-and-conquer merge sort algorithm.",
    category: ["Sorting", "Divide and Conquer", "Array"],
    difficulty: "Medium",
    intuition: "Divide the array into halves, recursively sort each half, then merge the sorted halves back together.",
    explanation: "Merge sort is a stable, comparison-based sorting algorithm that divides the array into smaller subarrays, sorts them, and then merges them back together.",
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
    },
    tags: ["sorting", "stable", "divide-conquer"],
    codes: [
      {
        language: "Python",
        code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      },
    ],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Depth-First Search (DFS)",
    problemStatement: "Traverse a graph or tree structure by exploring as far as possible along each branch before backtracking.",
    category: ["Graph", "Tree", "Recursion", "Backtracking"],
    difficulty: "Medium",
    intuition: "DFS explores a graph by going as deep as possible down one path before backing up and trying another path. It's like exploring a maze by always taking the first unexplored path.",
    explanation: "Depth-First Search is a graph traversal algorithm that starts at a root node and explores as far as possible along each branch before backtracking. It uses a stack data structure (or recursion).",
    complexity: {
      time: "O(V + E) where V is vertices and E is edges",
      space: "O(V) for the recursion stack",
    },
    tags: ["graph-traversal", "recursion", "fundamental"],
    codes: [
      {
        language: "Python",
        code: `def dfs_recursive(graph, start, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(start)
    print(start, end=' ')
    
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
    
    return visited

def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    
    while stack:
        node = stack.pop()
        
        if node not in visited:
            visited.add(node)
            print(node, end=' ')
            
            # Add neighbors to stack (in reverse order for consistent traversal)
            for neighbor in reversed(graph[node]):
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return visited

# Example usage
graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
}

print("DFS Recursive:")
dfs_recursive(graph, 'A')
print("\\nDFS Iterative:")
dfs_iterative(graph, 'A')`,
      },
    ],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Breadth-First Search (BFS)",
    problemStatement: "Traverse a graph level by level, visiting all nodes at the current depth before moving to nodes at the next depth level.",
    category: ["Graph", "Tree", "Queue"],
    difficulty: "Medium",
    intuition: "Use a queue to visit nodes level by level. Start from the root, add its neighbors to the queue, then process each node in the queue.",
    explanation: "BFS explores a graph by visiting all vertices at the current depth level before moving to vertices at the next depth level. It uses a queue data structure.",
    complexity: {
      time: "O(V + E)",
      space: "O(V)",
    },
    tags: ["graph-traversal", "level-order", "queue"],
    codes: [
      {
        language: "Python",
        code: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        
        if node not in visited:
            visited.add(node)
            result.append(node)
            
            for neighbor in graph[node]:
                if neighbor not in visited:
                    queue.append(neighbor)
    
    return result`,
      },
    ],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Two Sum",
    problemStatement: "Given an array of integers and a target sum, find two numbers in the array that add up to the target.",
    category: ["Array", "Hashing", "Two Pointers"],
    difficulty: "Easy",
    intuition: "Use a hash map to store numbers we've seen and their indices. For each number, check if its complement exists in the hash map.",
    explanation: "The two sum problem can be solved efficiently using a hash map to store previously seen numbers and their indices.",
    complexity: {
      time: "O(n)",
      space: "O(n)",
    },
    tags: ["hash-map", "array", "leetcode"],
    codes: [
      {
        language: "Python",
        code: `def two_sum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []  # No solution found`,
      },
    ],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Kadane's Algorithm",
    problemStatement: "Find the contiguous subarray with the largest sum in an array of integers.",
    category: ["Array", "Dynamic Programming"],
    difficulty: "Medium",
    intuition: "Keep track of the maximum sum ending at each position. At each step, decide whether to extend the existing subarray or start a new one.",
    explanation: "Kadane's algorithm finds the maximum sum contiguous subarray in O(n) time using dynamic programming principles.",
    complexity: {
      time: "O(n)",
      space: "O(1)",
    },
    tags: ["subarray", "maximum-sum", "dp"],
    codes: [
      {
        language: "Python",
        code: `def max_subarray_sum(nums):
    if not nums:
        return 0
    
    max_sum = current_sum = nums[0]
    
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum`,
      },
    ],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
];

// Sample data structures
const sampleDataStructures = [
  {
    title: "Binary Search Tree",
    definition: "A binary search tree (BST) is a binary tree where each node has at most two children, and for each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater.",
    category: ["Tree", "Binary Search Tree"],
    type: "Hierarchical",
    characteristics: "Maintains sorted order, allows efficient searching, insertion, and deletion. In-order traversal gives sorted sequence.",
    operations: [
      {
        name: "Search",
        description: "Find a value in the BST",
        complexity: {
          time: "O(log n) average, O(n) worst case",
          space: "O(log n) recursive, O(1) iterative",
        },
        implementations: [
          {
            codeDetails: {
              language: "Python",
              code: `def search(root, key):
    if root is None or root.val == key:
        return root
    
    if key < root.val:
        return search(root.left, key)
    else:
        return search(root.right, key)`,
            },
            explanation: "Search compares the target key with current node and recursively searches left or right subtree.",
            complexity: {
              time: "O(log n) average case",
              space: "O(log n) for recursion",
            },
          },
        ],
      },
    ],
    fullImplementations: [
      {
        language: "Python",
        code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, val):
        self.root = self._insert_recursive(self.root, val)
    
    def _insert_recursive(self, node, val):
        if node is None:
            return TreeNode(val)
        
        if val < node.val:
            node.left = self._insert_recursive(node.left, val)
        elif val > node.val:
            node.right = self._insert_recursive(node.right, val)
        
        return node`,
      },
    ],
    applications: [
      {
        domain: "Database Systems",
        examples: ["Database indexing", "B-trees in file systems"],
      },
    ],
    comparisons: [
      {
        with: "Hash Table",
        advantages: ["Maintains sorted order", "Range queries"],
        disadvantages: ["Slower average case", "Can become unbalanced"],
        whenToUse: "When you need sorted data and range operations",
      },
    ],
    tags: ["fundamental", "tree", "searching"],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Hash Table",
    definition: "A hash table (hash map) is a data structure that implements an associative array abstract data type, mapping keys to values using a hash function to compute an index into an array of buckets or slots.",
    category: ["Hash Table", "Array"],
    type: "Linear",
    characteristics: "Provides fast average-case performance for insertions, deletions, and lookups. Uses hash function to map keys to array indices.",
    operations: [
      {
        name: "Insert",
        description: "Add a key-value pair to the hash table",
        complexity: {
          time: "O(1) average, O(n) worst case",
          space: "O(1)",
        },
        implementations: [
          {
            codeDetails: {
              language: "Python",
              code: `def insert(self, key, value):
    index = self._hash(key)
    
    # Handle collision with chaining
    if self.table[index] is None:
        self.table[index] = []
    
    # Add new key-value pair
    self.table[index].append((key, value))
    self.size += 1`,
            },
            explanation: "Insert uses hash function to find index and handles collisions using chaining.",
            complexity: {
              time: "O(1) average case",
              space: "O(1)",
            },
          },
        ],
      },
    ],
    fullImplementations: [
      {
        language: "Python",
        code: `class HashTable:
    def __init__(self, capacity=10):
        self.capacity = capacity
        self.size = 0
        self.table = [None] * capacity
    
    def _hash(self, key):
        return hash(key) % self.capacity
    
    def insert(self, key, value):
        index = self._hash(key)
        
        if self.table[index] is None:
            self.table[index] = []
        
        self.table[index].append((key, value))
        self.size += 1`,
      },
    ],
    applications: [
      {
        domain: "Database Systems",
        examples: ["Database indexing", "Caching systems"],
      },
    ],
    comparisons: [
      {
        with: "Array",
        advantages: ["Fast lookups by key", "Dynamic sizing"],
        disadvantages: ["No ordering", "Memory overhead"],
        whenToUse: "When you need fast key-based access",
      },
    ],
    tags: ["fundamental", "hashing", "key-value"],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Stack",
    definition: "A stack is a linear data structure that follows the Last In, First Out (LIFO) principle. Elements are added and removed from the same end, called the top of the stack.",
    category: ["Stack", "Array"],
    type: "Linear",
    characteristics: "LIFO ordering, operations only at one end (top), simple and efficient for specific use cases like function calls and expression evaluation.",
    operations: [
      {
        name: "Push",
        description: "Add an element to the top of the stack",
        complexity: {
          time: "O(1)",
          space: "O(1)",
        },
        implementations: [
          {
            codeDetails: {
              language: "Python",
              code: `def push(self, item):
    self.items.append(item)`,
            },
            explanation: "Push adds element to the end of the underlying list.",
            complexity: {
              time: "O(1)",
              space: "O(1)",
            },
          },
        ],
      },
    ],
    fullImplementations: [
      {
        language: "Python",
        code: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()
    
    def is_empty(self):
        return len(self.items) == 0`,
      },
    ],
    applications: [
      {
        domain: "Programming Languages",
        examples: ["Function call management", "Expression evaluation"],
      },
    ],
    comparisons: [
      {
        with: "Queue",
        advantages: ["LIFO access pattern", "Simple implementation"],
        disadvantages: ["Limited access pattern", "No random access"],
        whenToUse: "When you need LIFO behavior like function calls",
      },
    ],
    tags: ["fundamental", "lifo", "basic"],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Queue",
    definition: "A queue is a linear data structure that follows the First In, First Out (FIFO) principle. Elements are added at the rear and removed from the front.",
    category: ["Queue", "Array"],
    type: "Linear",
    characteristics: "FIFO ordering, operations at both ends (front and rear), useful for scheduling and buffering.",
    operations: [
      {
        name: "Enqueue",
        description: "Add an element to the rear of the queue",
        complexity: {
          time: "O(1)",
          space: "O(1)",
        },
        implementations: [
          {
            codeDetails: {
              language: "Python",
              code: `def enqueue(self, item):
    self.items.append(item)`,
            },
            explanation: "Enqueue adds element to the end of the underlying list.",
            complexity: {
              time: "O(1)",
              space: "O(1)",
            },
          },
        ],
      },
    ],
    fullImplementations: [
      {
        language: "Python",
        code: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items.popleft()
    
    def is_empty(self):
        return len(self.items) == 0`,
      },
    ],
    applications: [
      {
        domain: "Operating Systems",
        examples: ["Process scheduling", "Print job management"],
      },
    ],
    comparisons: [
      {
        with: "Stack",
        advantages: ["FIFO access pattern", "Fair processing order"],
        disadvantages: ["Limited access pattern", "No random access"],
        whenToUse: "When you need FIFO behavior like task scheduling",
      },
    ],
    tags: ["fundamental", "fifo", "basic"],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
  {
    title: "Linked List",
    definition: "A linked list is a linear data structure where elements are stored in nodes, and each node contains data and a reference (link) to the next node in the sequence.",
    category: ["Linked List"],
    type: "Linear",
    characteristics: "Dynamic size, efficient insertion/deletion at beginning, sequential access, extra memory for pointers.",
    operations: [
      {
        name: "Insert at Beginning",
        description: "Add a new node at the start of the linked list",
        complexity: {
          time: "O(1)",
          space: "O(1)",
        },
        implementations: [
          {
            codeDetails: {
              language: "Python",
              code: `def insert_at_beginning(self, data):
    new_node = ListNode(data)
    new_node.next = self.head
    self.head = new_node`,
            },
            explanation: "Create new node and update head pointer.",
            complexity: {
              time: "O(1)",
              space: "O(1)",
            },
          },
        ],
      },
    ],
    fullImplementations: [
      {
        language: "Python",
        code: `class ListNode:
    def __init__(self, data=0, next=None):
        self.data = data
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_beginning(self, data):
        new_node = ListNode(data)
        new_node.next = self.head
        self.head = new_node
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        return elements`,
      },
    ],
    applications: [
      {
        domain: "Memory Management",
        examples: ["Dynamic memory allocation", "Garbage collection"],
      },
    ],
    comparisons: [
      {
        with: "Array",
        advantages: ["Dynamic size", "Efficient insertion at beginning"],
        disadvantages: ["No random access", "Extra memory overhead"],
        whenToUse: "When frequent insertions/deletions at beginning are needed",
      },
    ],
    tags: ["fundamental", "pointer", "dynamic"],
    isPublished: true,
    status: "approved",
    isVerified: true,
  },
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Algorithm.deleteMany({});
    await DataStructure.deleteMany({});

    // Create users
    console.log("👥 Creating users...");
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`   ✓ Created user: ${userData.username}`);
    }

    // Get admin user for creating content
    const adminUser = createdUsers.find(user => user.role === 'admin');

    // Create algorithms
    console.log("🔢 Creating algorithms...");
    for (const algoData of sampleAlgorithms) {
      const algorithm = new Algorithm({
        ...algoData,
        slug: slugify(algoData.title, { lower: true }),
        createdBy: adminUser._id,
        publishedBy: adminUser._id,
        publishedAt: new Date(),
        contributors: [
          {
            user: adminUser._id,
            contributionType: "create",
            description: "Initial creation",
          },
        ],
      });
      await algorithm.save();
      console.log(`   ✓ Created algorithm: ${algoData.title}`);
    }

    // Create data structures
    console.log("🏗️ Creating data structures...");
    for (const dsData of sampleDataStructures) {
      const dataStructure = new DataStructure({
        ...dsData,
        slug: slugify(dsData.title, { lower: true }),
        createdBy: adminUser._id,
        publishedBy: adminUser._id,
        publishedAt: new Date(),
        contributors: [
          {
            user: adminUser._id,
            contributionType: "create",
            description: "Initial creation",
          },
        ],
      });
      await dataStructure.save();
      console.log(`   ✓ Created data structure: ${dsData.title}`);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Algorithms: ${sampleAlgorithms.length}`);
    console.log(`   - Data Structures: ${sampleDataStructures.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();