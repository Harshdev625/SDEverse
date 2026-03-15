const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const ProblemSheet = require('../models/sheet.model');
const Problem = require('../models/problem.model');
const SheetProblem = require('../models/sheetProblem.model');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const blind75Problems = [
  // ARRAY (9 problems)
  {
    title: 'Two Sum',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/two-sum/',
    tags: ['Array', 'Hash Table'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Find the maximum profit from buying and selling stock given an array of prices.',
  },
  {
    title: 'Contains Duplicate',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/contains-duplicate/',
    tags: ['Array', 'Hash Table', 'Sorting'],
    description: 'Determine if any value appears at least twice in an array.',
  },
  {
    title: 'Product of Array Except Self',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/product-of-array-except-self/',
    tags: ['Array', 'Prefix Sum'],
    description: 'Return an array where each element is the product of all elements except itself.',
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/maximum-subarray/',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    description: 'Find the subarray with the largest sum.',
  },
  {
    title: 'Maximum Product Subarray',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/maximum-product-subarray/',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Find the contiguous subarray within an array which has the largest product.',
  },
  {
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    tags: ['Array', 'Binary Search'],
    description: 'Find the minimum element in a rotated sorted array.',
  },
  {
    title: 'Search in Rotated Sorted Array',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    tags: ['Array', 'Binary Search'],
    description: 'Search for a target value in a rotated sorted array.',
  },
  {
    title: '3Sum',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/3sum/',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    description: 'Find all unique triplets in the array which gives the sum of zero.',
  },
  {
    title: 'Container With Most Water',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/container-with-most-water/',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    description: 'Find two lines that together with the x-axis form a container that holds the most water.',
  },
  
  // BINARY (5 problems)
  {
    title: 'Sum of Two Integers',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/sum-of-two-integers/',
    tags: ['Math', 'Bit Manipulation'],
    description: 'Calculate the sum of two integers without using + or - operators.',
  },
  {
    title: 'Number of 1 Bits',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/number-of-1-bits/',
    tags: ['Bit Manipulation'],
    description: 'Write a function that takes an unsigned integer and returns the number of 1 bits.',
  },
  {
    title: 'Counting Bits',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/counting-bits/',
    tags: ['Dynamic Programming', 'Bit Manipulation'],
    description: 'For every number from 0 to n, count the number of 1s in their binary representation.',
  },
  {
    title: 'Missing Number',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/missing-number/',
    tags: ['Array', 'Hash Table', 'Math', 'Bit Manipulation'],
    description: 'Find the missing number in an array containing n distinct numbers taken from 0 to n.',
  },
  {
    title: 'Reverse Bits',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/reverse-bits/',
    tags: ['Bit Manipulation'],
    description: 'Reverse bits of a given 32 bits unsigned integer.',
  },

  // DYNAMIC PROGRAMMING (11 problems)
  {
    title: 'Climbing Stairs',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/climbing-stairs/',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    description: 'Count the number of distinct ways to climb to the top of a staircase.',
  },
  {
    title: 'Coin Change',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/coin-change/',
    tags: ['Array', 'Dynamic Programming', 'BFS'],
    description: 'Find the minimum number of coins needed to make up a given amount.',
  },
  {
    title: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    tags: ['Array', 'Binary Search', 'Dynamic Programming'],
    description: 'Find the length of the longest strictly increasing subsequence.',
  },
  {
    title: 'Longest Common Subsequence',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/longest-common-subsequence/',
    tags: ['String', 'Dynamic Programming'],
    description: 'Find the length of the longest common subsequence of two strings.',
  },
  {
    title: 'Word Break',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/word-break/',
    tags: ['Hash Table', 'String', 'Dynamic Programming'],
    description: 'Determine if a string can be segmented into words from a given dictionary.',
  },
  {
    title: 'Combination Sum',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/combination-sum-iv/',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Find the number of possible combinations that add up to target.',
  },
  {
    title: 'House Robber',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/house-robber/',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Determine the maximum amount of money you can rob without robbing adjacent houses.',
  },
  {
    title: 'House Robber II',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/house-robber-ii/',
    tags: ['Array', 'Dynamic Programming'],
    description: 'House Robber problem where houses are arranged in a circle.',
  },
  {
    title: 'Decode Ways',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/decode-ways/',
    tags: ['String', 'Dynamic Programming'],
    description: 'Count the number of ways to decode a string of digits.',
  },
  {
    title: 'Unique Paths',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/unique-paths/',
    tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
    description: 'Count unique paths from top-left to bottom-right in a grid.',
  },
  {
    title: 'Jump Game',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/jump-game/',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    description: 'Determine if you can reach the last index of an array.',
  },

  // GRAPH (6 problems)
  {
    title: 'Clone Graph',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/clone-graph/',
    tags: ['Hash Table', 'DFS', 'BFS', 'Graph'],
    description: 'Return a deep copy of an undirected graph.',
  },
  {
    title: 'Course Schedule',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/course-schedule/',
    tags: ['DFS', 'BFS', 'Graph', 'Topological Sort'],
    description: 'Determine if you can finish all courses given prerequisites.',
  },
  {
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
    tags: ['Array', 'DFS', 'BFS', 'Matrix'],
    description: 'Find cells where water can flow to both Pacific and Atlantic oceans.',
  },
  {
    title: 'Number of Islands',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/number-of-islands/',
    tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'],
    description: 'Count the number of islands in a 2D grid.',
  },
  {
    title: 'Longest Consecutive Sequence',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    tags: ['Array', 'Hash Table', 'Union Find'],
    description: 'Find the length of the longest consecutive elements sequence.',
  },
  {
    title: 'Graph Valid Tree',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/graph-valid-tree/',
    tags: ['DFS', 'BFS', 'Union Find', 'Graph'],
    description: 'Determine if edges make a valid tree.',
  },
  {
    title: 'Number of Connected Components in an Undirected Graph',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/',
    tags: ['DFS', 'BFS', 'Union Find', 'Graph'],
    description: 'Count the number of connected components in an undirected graph.',
  },
  {
    title: 'Alien Dictionary',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/alien-dictionary/',
    tags: ['Array', 'String', 'DFS', 'BFS', 'Graph', 'Topological Sort'],
    description: 'Derive the order of characters in an alien language from a sorted dictionary.',
  },

  // INTERVAL (6 problems)
  {
    title: 'Insert Interval',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/insert-interval/',
    tags: ['Array'],
    description: 'Insert a new interval into a sorted list of non-overlapping intervals.',
  },
  {
    title: 'Merge Intervals',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/merge-intervals/',
    tags: ['Array', 'Sorting'],
    description: 'Merge all overlapping intervals.',
  },
  {
    title: 'Non-overlapping Intervals',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/non-overlapping-intervals/',
    tags: ['Array', 'Dynamic Programming', 'Greedy', 'Sorting'],
    description: 'Find the minimum number of intervals to remove to make the rest non-overlapping.',
  },
  {
    title: 'Meeting Rooms',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/meeting-rooms/',
    tags: ['Array', 'Sorting'],
    description: 'Determine if a person can attend all meetings.',
  },
  {
    title: 'Meeting Rooms II',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/meeting-rooms-ii/',
    tags: ['Array', 'Two Pointers', 'Greedy', 'Sorting', 'Heap'],
    description: 'Find the minimum number of conference rooms required.',
  },
  {
    title: 'Interval List Intersections',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/interval-list-intersections/',
    tags: ['Array', 'Two Pointers'],
    description: 'Find the intersection of two lists of intervals.',
  },

  // LINKED LIST (6 problems)
  {
    title: 'Reverse Linked List',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/reverse-linked-list/',
    tags: ['Linked List', 'Recursion'],
    description: 'Reverse a singly linked list.',
  },
  {
    title: 'Linked List Cycle',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/linked-list-cycle/',
    tags: ['Hash Table', 'Linked List', 'Two Pointers'],
    description: 'Detect if a linked list has a cycle.',
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    tags: ['Linked List', 'Recursion'],
    description: 'Merge two sorted linked lists into one sorted list.',
  },
  {
    title: 'Merge K Sorted Lists',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    tags: ['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    description: 'Merge k sorted linked lists into one sorted list.',
  },
  {
    title: 'Remove Nth Node From End of List',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    tags: ['Linked List', 'Two Pointers'],
    description: 'Remove the nth node from the end of a linked list.',
  },
  {
    title: 'Reorder List',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/reorder-list/',
    tags: ['Linked List', 'Two Pointers', 'Stack', 'Recursion'],
    description: 'Reorder a linked list to a specific pattern.',
  },

  // MATRIX (4 problems)
  {
    title: 'Set Matrix Zeroes',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/set-matrix-zeroes/',
    tags: ['Array', 'Hash Table', 'Matrix'],
    description: 'Set entire row and column to 0 if an element is 0.',
  },
  {
    title: 'Spiral Matrix',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/spiral-matrix/',
    tags: ['Array', 'Matrix', 'Simulation'],
    description: 'Return all elements of a matrix in spiral order.',
  },
  {
    title: 'Rotate Image',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/rotate-image/',
    tags: ['Array', 'Math', 'Matrix'],
    description: 'Rotate a 2D matrix by 90 degrees clockwise.',
  },
  {
    title: 'Word Search',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/word-search/',
    tags: ['Array', 'Backtracking', 'Matrix'],
    description: 'Find if a word exists in a 2D board.',
  },

  // STRING (9 problems)
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description: 'Find the length of the longest substring without repeating characters.',
  },
  {
    title: 'Longest Repeating Character Replacement',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description: 'Find the length of the longest substring with same letter after k replacements.',
  },
  {
    title: 'Minimum Window Substring',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/minimum-window-substring/',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description: 'Find the minimum window substring containing all characters of another string.',
  },
  {
    title: 'Valid Anagram',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/valid-anagram/',
    tags: ['Hash Table', 'String', 'Sorting'],
    description: 'Determine if two strings are anagrams of each other.',
  },
  {
    title: 'Group Anagrams',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/group-anagrams/',
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    description: 'Group anagrams together from a list of strings.',
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/valid-parentheses/',
    tags: ['String', 'Stack'],
    description: 'Determine if a string of parentheses is valid.',
  },
  {
    title: 'Valid Palindrome',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/valid-palindrome/',
    tags: ['Two Pointers', 'String'],
    description: 'Determine if a string is a palindrome, ignoring non-alphanumeric characters.',
  },
  {
    title: 'Longest Palindromic Substring',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/longest-palindromic-substring/',
    tags: ['String', 'Dynamic Programming'],
    description: 'Find the longest palindromic substring.',
  },
  {
    title: 'Palindromic Substrings',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/palindromic-substrings/',
    tags: ['String', 'Dynamic Programming'],
    description: 'Count the number of palindromic substrings.',
  },
  {
    title: 'Encode and Decode Strings',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/encode-and-decode-strings/',
    tags: ['Array', 'String', 'Design'],
    description: 'Design an algorithm to encode a list of strings to a single string and decode it back.',
  },

  // TREE (11 problems)
  {
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    description: 'Find the maximum depth of a binary tree.',
  },
  {
    title: 'Same Tree',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/same-tree/',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    description: 'Determine if two binary trees are identical.',
  },
  {
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/invert-binary-tree/',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    description: 'Invert a binary tree.',
  },
  {
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    tags: ['Dynamic Programming', 'Tree', 'DFS', 'Binary Tree'],
    description: 'Find the maximum path sum in a binary tree.',
  },
  {
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    tags: ['Tree', 'BFS', 'Binary Tree'],
    description: 'Return the level order traversal of a binary tree.',
  },
  {
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    tags: ['String', 'Tree', 'DFS', 'BFS', 'Design', 'Binary Tree'],
    description: 'Design an algorithm to serialize and deserialize a binary tree.',
  },
  {
    title: 'Subtree of Another Tree',
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/subtree-of-another-tree/',
    tags: ['Tree', 'DFS', 'Binary Tree', 'String Matching', 'Hash Function'],
    description: 'Check if a tree is a subtree of another tree.',
  },
  {
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Tree', 'Binary Tree'],
    description: 'Construct a binary tree from preorder and inorder traversal arrays.',
  },
  {
    title: 'Validate Binary Search Tree',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/validate-binary-search-tree/',
    tags: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'],
    description: 'Determine if a binary tree is a valid binary search tree.',
  },
  {
    title: 'Kth Smallest Element in a BST',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
    tags: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'],
    description: 'Find the kth smallest element in a BST.',
  },
  {
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    tags: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'],
    description: 'Find the lowest common ancestor of two nodes in a BST.',
  },
  {
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    tags: ['Hash Table', 'String', 'Design', 'Trie'],
    description: 'Implement a trie with insert, search, and startsWith methods.',
  },
  {
    title: 'Word Search II',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/word-search-ii/',
    tags: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'],
    description: 'Find all words from a dictionary that can be formed in a 2D board.',
  },

  // HEAP (2 problems)
  {
    title: 'Top K Frequent Elements',
    difficulty: 'medium',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/top-k-frequent-elements/',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Sorting', 'Heap', 'Bucket Sort', 'Quickselect'],
    description: 'Find the k most frequent elements in an array.',
  },
  {
    title: 'Find Median from Data Stream',
    difficulty: 'hard',
    platform: 'leetcode',
    platformLink: 'https://leetcode.com/problems/find-median-from-data-stream/',
    tags: ['Two Pointers', 'Design', 'Sorting', 'Heap', 'Data Stream'],
    description: 'Design a data structure that supports finding the median from a data stream.',
  },
];

const importBlind75 = async () => {
  try {
    console.log('Starting Blind 75 import...');

    // Create the Blind 75 sheet
    const blind75Sheet = new ProblemSheet({
      name: 'Blind 75',
      description: 'The 75 essential LeetCode problems curated by a Facebook tech lead. Master these problems to ace your coding interviews at top tech companies.',
      slug: 'blind-75',
      icon: '🔥',
      totalProblems: 0,
      isActive: true,
    });

    const createdSheet = await blind75Sheet.save();
    console.log('✓ Blind 75 sheet created');

    let problemsCreated = 0;
    let problemsAddedToSheet = 0;

    // Process each problem
    for (let i = 0; i < blind75Problems.length; i++) {
      const problemData = blind75Problems[i];
      
      // Check if problem already exists (by title)
      let problem = await Problem.findOne({ title: problemData.title });
      
      if (!problem) {
        // Create new problem
        problem = new Problem(problemData);
        await problem.save();
        problemsCreated++;
        console.log(`✓ Created: ${problemData.title}`);
      } else {
        console.log(`- Already exists: ${problemData.title}`);
      }

      // Add problem to sheet (if not already added)
      const existingSheetProblem = await SheetProblem.findOne({
        sheetId: createdSheet._id,
        problemId: problem._id,
      });

      if (!existingSheetProblem) {
        const sheetProblem = new SheetProblem({
          sheetId: createdSheet._id,
          problemId: problem._id,
          order: i + 1,
        });
        await sheetProblem.save();
        problemsAddedToSheet++;
      }
    }

    // Update the sheet's totalProblems count
    createdSheet.totalProblems = blind75Problems.length;
    await createdSheet.save();

    console.log('\n========================================');
    console.log('✅ Blind 75 import completed successfully!');
    console.log('========================================');
    console.log(`📝 New problems created: ${problemsCreated}`);
    console.log(`🔗 Problems added to sheet: ${problemsAddedToSheet}`);
    console.log(`📊 Total problems in Blind 75: ${blind75Problems.length}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing Blind 75:', error);
    process.exit(1);
  }
};

const clearBlind75 = async () => {
  try {
    console.log('Clearing Blind 75 data...');

    const sheet = await ProblemSheet.findOne({ slug: 'blind-75' });
    
    if (sheet) {
      // Delete sheet-problem relationships
      await SheetProblem.deleteMany({ sheetId: sheet._id });
      
      // Delete the sheet
      await ProblemSheet.deleteOne({ _id: sheet._id });
      
      console.log('✓ Blind 75 sheet and relationships deleted');
    } else {
      console.log('- Blind 75 sheet not found');
    }

    console.log('✅ Blind 75 data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing Blind 75:', error);
    process.exit(1);
  }
};

// Command line arguments
if (process.argv[2] === '-d') {
  clearBlind75();
} else {
  importBlind75();
}
