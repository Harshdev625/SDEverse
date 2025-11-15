const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const ProblemSheet = require('./models/problemSheet.model');
const Problem = require('./models/problem.model');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const problemsData = [
  // 1. Array
  {
    order: 1,
    title: 'Two Sum',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/two-sum/',
    tags: ['Array', 'Hash Table'],
    hints: [
      {
        hintNumber: 1,
        content:
          'A really brute force way would be to search for all possible pairs of numbers, but that will be O(n^2).',
      },
      {
        hintNumber: 2,
        content:
          'To optimize, you can use a hash map to store the numbers you have seen so far and their indices. This allows you to check for the complement in O(1) time.',
      },
    ],
    solution: {
      content: {
        python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        prevMap = {} # val -> index

        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i`,
        javascript: `var twoSum = function(nums, target) {
    let map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        let complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
};`,
      },
    },
  },
  {
    order: 2,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink:
      'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    tags: ['Array', 'Dynamic Programming'],
  },
  {
    order: 3,
    title: 'Product of Array Except Self',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/product-of-array-except-self/',
    tags: ['Array', 'Prefix Sum'],
  },
  {
    order: 4,
    title: '3Sum',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/3sum/',
    tags: ['Array', 'Two Pointers', 'Sorting'],
  },
  {
    order: 5,
    title: 'Container With Most Water',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/container-with-most-water/',
    tags: ['Array', 'Two Pointers', 'Greedy'],
  },
  // 2. String
  {
    order: 6,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink:
      'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    tags: ['Hash Table', 'String', 'Sliding Window'],
  },
  {
    order: 7,
    title: 'Valid Parentheses',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/valid-parentheses/',
    tags: ['Stack', 'String'],
  },
  {
    order: 8,
    title: 'Longest Palindromic Substring',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink:
      'https://leetcode.com/problems/longest-palindromic-substring/',
    tags: ['String', 'Dynamic Programming'],
  },
  // 3. Linked List
  {
    order: 9,
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    tags: ['Linked List', 'Recursion'],
  },
  {
    order: 10,
    title: 'Linked List Cycle',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/linked-list-cycle/',
    tags: ['Hash Table', 'Linked List', 'Two Pointers'],
  },
  {
    order: 11,
    title: 'Merge k Sorted Lists',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    tags: ['Linked List', 'Priority Queue', 'Heap', 'Merge Sort'],
  },
  // 4. Tree
  {
    order: 12,
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/invert-binary-tree/',
    tags: ['Tree', 'DFS', 'BFS', 'Recursion'],
  },
  {
    order: 13,
    title: 'Kth Smallest Element in a BST',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink:
      'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
    tags: ['Tree', 'BST', 'Inorder Traversal', 'DFS'],
  },
  {
    order: 14,
    title: 'Word Search II',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/word-search-ii/',
    tags: ['Array', 'String', 'Backtracking', 'Trie'],
  },
  // 5. Heap
  {
    order: 15,
    title: 'Top K Frequent Elements',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/top-k-frequent-elements/',
    tags: ['Array', 'Hash Table', 'Heap', 'Quickselect'],
  },
  // 6. Dynamic Programming
  {
    order: 16,
    title: 'Coin Change',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/coin-change/',
    tags: ['Dynamic Programming', 'Array', 'BFS'],
  },
];

const importData = async () => {
  try {
    // Clear existing data
    await Problem.deleteMany();
    await ProblemSheet.deleteMany();

    // Create the Problem Sheet
    const sheet = new ProblemSheet({
      name: 'Blind 75',
      description:
        'The 75 essential LeetCode problems to prepare for interviews, curated by the tech community.',
      icon: '🔥',
      totalProblems: 0, // Will update this later
      isActive: true,
    });

    const createdSheet = await sheet.save();
    console.log('Problem Sheet created');

    // Add sheetId to all problems
    const problemsToCreate = problemsData.map((problem) => ({
      ...problem,
      sheetId: createdSheet._id,
    }));

    // Insert all problems
    const createdProblems = await Problem.insertMany(problemsToCreate);
    console.log(`${createdProblems.length} problems created`);

    // Update the sheet's totalProblems count
    createdSheet.totalProblems = createdProblems.length;
    await createdSheet.save();

    console.log('-------------------------');
    console.log('Data successfully imported!');
    console.log(`Created 1 sheet and ${createdProblems.length} problems.`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Problem.deleteMany();
    await ProblemSheet.deleteMany();

    console.log('Data successfully destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}