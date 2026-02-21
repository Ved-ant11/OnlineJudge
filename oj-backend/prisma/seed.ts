import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Difficulty } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not found");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  // ─── 1. Two Sum ───────────────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "two-sum" },
    update: {},
    create: {
      id: "two-sum",
      title: "Two Sum",
      statement: `
Given an array of integers \`nums\` and an integer \`target\`,
return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution,
and you may not use the same element twice.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "nums[0] + nums[1] = 9",
        },
      ],
      constraints: `
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "two-sum",
        input: "2 7 11 15\n9",
        expectedOutput: "0 1",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "two-sum",
        input: "3 2 4\n6",
        expectedOutput: "1 2",
        order: 2,
        isHidden: true,
      },
      {
        questionId: "two-sum",
        input: "3 3\n6",
        expectedOutput: "0 1",
        order: 3,
        isHidden: true,
      },
    ],
  });

  // ─── 2. Reverse String ───────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "reverse-string" },
    update: {},
    create: {
      id: "reverse-string",
      title: "Reverse String",
      statement: `
Write a function that reverses a string.

You are given the string as a single line of input.
Print the reversed string as output.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: 's = "hello"',
          output: '"olleh"',
          explanation: 'The reverse of "hello" is "olleh".',
        },
        {
          input: 's = "Hannah"',
          output: '"hannaH"',
          explanation: 'The reverse of "Hannah" is "hannaH".',
        },
      ],
      constraints: `
- 1 ≤ s.length ≤ 10⁵
- s consists of printable ASCII characters.
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "reverse-string",
        input: "hello",
        expectedOutput: "olleh",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "reverse-string",
        input: "Hannah",
        expectedOutput: "hannaH",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "reverse-string",
        input: "a",
        expectedOutput: "a",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "reverse-string",
        input: "racecar",
        expectedOutput: "racecar",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "reverse-string",
        input: "OpenAI is cool",
        expectedOutput: "looc si IAnepO",
        order: 5,
        isHidden: true,
      },
    ],
  });

  // ─── 3. Palindrome Number ────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "palindrome-number" },
    update: {},
    create: {
      id: "palindrome-number",
      title: "Palindrome Number",
      statement: `
Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward.

**Input:** A single integer \`x\`.
**Output:** Print \`true\` or \`false\`.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: "x = 121",
          output: "true",
          explanation:
            "121 reads as 121 from left to right and from right to left.",
        },
        {
          input: "x = -121",
          output: "false",
          explanation:
            "From left to right, it reads -121. From right to left it becomes 121-. Therefore it is not a palindrome.",
        },
        {
          input: "x = 10",
          output: "false",
          explanation:
            "Reads 01 from right to left. Therefore it is not a palindrome.",
        },
      ],
      constraints: `
- -2³¹ ≤ x ≤ 2³¹ - 1
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "palindrome-number",
        input: "121",
        expectedOutput: "true",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "palindrome-number",
        input: "-121",
        expectedOutput: "false",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "palindrome-number",
        input: "10",
        expectedOutput: "false",
        order: 3,
        isHidden: false,
      },
      {
        questionId: "palindrome-number",
        input: "0",
        expectedOutput: "true",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "palindrome-number",
        input: "12321",
        expectedOutput: "true",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "palindrome-number",
        input: "1000021",
        expectedOutput: "false",
        order: 6,
        isHidden: true,
      },
    ],
  });

  // ─── 4. FizzBuzz ─────────────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "fizzbuzz" },
    update: {},
    create: {
      id: "fizzbuzz",
      title: "FizzBuzz",
      statement: `
Given an integer \`n\`, print a string for each number from \`1\` to \`n\` (each on a new line):

- \`"FizzBuzz"\` if the number is divisible by both 3 and 5.
- \`"Fizz"\` if the number is divisible by 3.
- \`"Buzz"\` if the number is divisible by 5.
- The number itself if none of the above conditions are true.

**Input:** A single integer \`n\`.
**Output:** Print each result on a new line.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: "n = 5",
          output: "1\\n2\\nFizz\\n4\\nBuzz",
          explanation: "1 → 1, 2 → 2, 3 → Fizz, 4 → 4, 5 → Buzz",
        },
        {
          input: "n = 15",
          output:
            "1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz\\n13\\n14\\nFizzBuzz",
          explanation:
            "15 is divisible by both 3 and 5, so it prints FizzBuzz.",
        },
      ],
      constraints: `
- 1 ≤ n ≤ 10⁴
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "fizzbuzz",
        input: "5",
        expectedOutput: "1\n2\nFizz\n4\nBuzz",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "fizzbuzz",
        input: "3",
        expectedOutput: "1\n2\nFizz",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "fizzbuzz",
        input: "15",
        expectedOutput:
          "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "fizzbuzz",
        input: "1",
        expectedOutput: "1",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "fizzbuzz",
        input: "30",
        expectedOutput:
          "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz",
        order: 5,
        isHidden: true,
      },
    ],
  });

  // ─── 5. Valid Anagram ────────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "valid-anagram" },
    update: {},
    create: {
      id: "valid-anagram",
      title: "Valid Anagram",
      statement: `
Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **anagram** is a word formed by rearranging the letters of a different word, using all the original letters exactly once.

**Input:**
- Line 1: string \`s\`
- Line 2: string \`t\`

**Output:** Print \`true\` or \`false\`.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: 's = "anagram", t = "nagaram"',
          output: "true",
          explanation: '"nagaram" is an anagram of "anagram".',
        },
        {
          input: 's = "rat", t = "car"',
          output: "false",
          explanation: '"car" is not an anagram of "rat".',
        },
      ],
      constraints: `
- 1 ≤ s.length, t.length ≤ 5 × 10⁴
- s and t consist of lowercase English letters.
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "valid-anagram",
        input: "anagram\nnagaram",
        expectedOutput: "true",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "valid-anagram",
        input: "rat\ncar",
        expectedOutput: "false",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "valid-anagram",
        input: "listen\nsilent",
        expectedOutput: "true",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "valid-anagram",
        input: "hello\nworld",
        expectedOutput: "false",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "valid-anagram",
        input: "a\na",
        expectedOutput: "true",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "valid-anagram",
        input: "ab\na",
        expectedOutput: "false",
        order: 6,
        isHidden: true,
      },
    ],
  });

  // ─── 6. Maximum Subarray ─────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "maximum-subarray" },
    update: {},
    create: {
      id: "maximum-subarray",
      title: "Maximum Subarray",
      statement: `
Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.

**Input:**
- Line 1: space-separated integers representing the array \`nums\`.

**Output:** Print the maximum subarray sum.
      `,
      difficulty: Difficulty.MEDIUM,
      examples: [
        {
          input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
          output: "6",
          explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
        },
        {
          input: "nums = [1]",
          output: "1",
          explanation: "The subarray [1] has the largest sum 1.",
        },
        {
          input: "nums = [5,4,-1,7,8]",
          output: "23",
          explanation: "The subarray [5,4,-1,7,8] has the largest sum 23.",
        },
      ],
      constraints: `
- 1 ≤ nums.length ≤ 10⁵
- -10⁴ ≤ nums[i] ≤ 10⁴
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "maximum-subarray",
        input: "-2 1 -3 4 -1 2 1 -5 4",
        expectedOutput: "6",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "maximum-subarray",
        input: "1",
        expectedOutput: "1",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "maximum-subarray",
        input: "5 4 -1 7 8",
        expectedOutput: "23",
        order: 3,
        isHidden: false,
      },
      {
        questionId: "maximum-subarray",
        input: "-1",
        expectedOutput: "-1",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "maximum-subarray",
        input: "-2 -3 -1 -5",
        expectedOutput: "-1",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "maximum-subarray",
        input: "1 2 3 4 5",
        expectedOutput: "15",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "maximum-subarray",
        input: "-1 -2 3 4 -5 6",
        expectedOutput: "8",
        order: 7,
        isHidden: true,
      },
    ],
  });

  // ─── 7. Valid Parentheses ────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "valid-parentheses" },
    update: {},
    create: {
      id: "valid-parentheses",
      title: "Valid Parentheses",
      statement: `
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Input:** A single string \`s\`.
**Output:** Print \`true\` or \`false\`.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: 's = "()"',
          output: "true",
          explanation: "Single pair of matching parentheses.",
        },
        {
          input: 's = "()[]{}"',
          output: "true",
          explanation: "All bracket types are properly matched.",
        },
        {
          input: 's = "(]"',
          output: "false",
          explanation: "Mismatched bracket types.",
        },
      ],
      constraints: `
- 1 ≤ s.length ≤ 10⁴
- s consists of parentheses only \`'()[]{}'\`.
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "valid-parentheses",
        input: "()",
        expectedOutput: "true",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "valid-parentheses",
        input: "()[]{}",
        expectedOutput: "true",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "valid-parentheses",
        input: "(]",
        expectedOutput: "false",
        order: 3,
        isHidden: false,
      },
      {
        questionId: "valid-parentheses",
        input: "([)]",
        expectedOutput: "false",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "valid-parentheses",
        input: "{[]}",
        expectedOutput: "true",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "valid-parentheses",
        input: "(",
        expectedOutput: "false",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "valid-parentheses",
        input: "(((())))[]{}",
        expectedOutput: "true",
        order: 7,
        isHidden: true,
      },
    ],
  });

  // ─── 8. Best Time to Buy and Sell Stock ──────────────────────
  await prisma.question.upsert({
    where: { id: "buy-sell-stock" },
    update: {},
    create: {
      id: "buy-sell-stock",
      title: "Best Time to Buy and Sell Stock",
      statement: `
You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.

**Input:** Space-separated integers representing stock prices.
**Output:** Print the maximum profit.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: "prices = [7,1,5,3,6,4]",
          output: "5",
          explanation:
            "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.",
        },
        {
          input: "prices = [7,6,4,3,1]",
          output: "0",
          explanation:
            "No profitable transaction is possible, so max profit = 0.",
        },
      ],
      constraints: `
- 1 ≤ prices.length ≤ 10⁵
- 0 ≤ prices[i] ≤ 10⁴
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "buy-sell-stock",
        input: "7 1 5 3 6 4",
        expectedOutput: "5",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "buy-sell-stock",
        input: "7 6 4 3 1",
        expectedOutput: "0",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "buy-sell-stock",
        input: "1 2",
        expectedOutput: "1",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "buy-sell-stock",
        input: "2 4 1",
        expectedOutput: "2",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "buy-sell-stock",
        input: "3 3 3",
        expectedOutput: "0",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "buy-sell-stock",
        input: "1 4 2 7",
        expectedOutput: "6",
        order: 6,
        isHidden: true,
      },
    ],
  });

  // ─── 9. Contains Duplicate ───────────────────────────────────
  await prisma.question.upsert({
    where: { id: "contains-duplicate" },
    update: {},
    create: {
      id: "contains-duplicate",
      title: "Contains Duplicate",
      statement: `
Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.

**Input:** Space-separated integers representing the array.
**Output:** Print \`true\` or \`false\`.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: "nums = [1,2,3,1]",
          output: "true",
          explanation: "1 appears twice.",
        },
        {
          input: "nums = [1,2,3,4]",
          output: "false",
          explanation: "All elements are distinct.",
        },
      ],
      constraints: `
- 1 ≤ nums.length ≤ 10⁵
- -10⁹ ≤ nums[i] ≤ 10⁹
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "contains-duplicate",
        input: "1 2 3 1",
        expectedOutput: "true",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "contains-duplicate",
        input: "1 2 3 4",
        expectedOutput: "false",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "contains-duplicate",
        input: "1 1 1 3 3 4 3 2 4 2",
        expectedOutput: "true",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "contains-duplicate",
        input: "1",
        expectedOutput: "false",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "contains-duplicate",
        input: "1 2 3 4 5 6 7 8 9 10",
        expectedOutput: "false",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "contains-duplicate",
        input: "0 0",
        expectedOutput: "true",
        order: 6,
        isHidden: true,
      },
    ],
  });

  // ─── 10. Climbing Stairs ─────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "climbing-stairs" },
    update: {},
    create: {
      id: "climbing-stairs",
      title: "Climbing Stairs",
      statement: `
You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

**Input:** A single integer \`n\`.
**Output:** Print the number of distinct ways.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: "n = 2",
          output: "2",
          explanation: "Two ways: 1+1 or 2.",
        },
        {
          input: "n = 3",
          output: "3",
          explanation: "Three ways: 1+1+1, 1+2, 2+1.",
        },
      ],
      constraints: `
- 1 ≤ n ≤ 45
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "climbing-stairs",
        input: "2",
        expectedOutput: "2",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "climbing-stairs",
        input: "3",
        expectedOutput: "3",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "climbing-stairs",
        input: "1",
        expectedOutput: "1",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "climbing-stairs",
        input: "4",
        expectedOutput: "5",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "climbing-stairs",
        input: "5",
        expectedOutput: "8",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "climbing-stairs",
        input: "10",
        expectedOutput: "89",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "climbing-stairs",
        input: "45",
        expectedOutput: "1836311903",
        order: 7,
        isHidden: true,
      },
    ],
  });

  // ─── 11. Binary Search ───────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "binary-search" },
    update: {},
    create: {
      id: "binary-search",
      title: "Binary Search",
      statement: `
Given a sorted (in ascending order) integer array \`nums\` and a \`target\` value, return the index if the target is found. If not, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

**Input:**
- Line 1: space-separated sorted integers.
- Line 2: the target integer.

**Output:** Print the index of the target, or \`-1\` if not found.
      `,
      difficulty: Difficulty.EASY,
      examples: [
        {
          input: "nums = [-1,0,3,5,9,12], target = 9",
          output: "4",
          explanation: "9 exists in nums and its index is 4.",
        },
        {
          input: "nums = [-1,0,3,5,9,12], target = 2",
          output: "-1",
          explanation: "2 does not exist in nums so return -1.",
        },
      ],
      constraints: `
- 1 ≤ nums.length ≤ 10⁴
- All the integers in nums are unique.
- nums is sorted in ascending order.
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "binary-search",
        input: "-1 0 3 5 9 12\n9",
        expectedOutput: "4",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "binary-search",
        input: "-1 0 3 5 9 12\n2",
        expectedOutput: "-1",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "binary-search",
        input: "5\n5",
        expectedOutput: "0",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "binary-search",
        input: "2 5\n5",
        expectedOutput: "1",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "binary-search",
        input: "1 2 3 4 5 6 7 8 9 10\n10",
        expectedOutput: "9",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "binary-search",
        input: "1 2 3 4 5 6 7 8 9 10\n0",
        expectedOutput: "-1",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "binary-search",
        input: "1 3 5 7 9 11 13\n7",
        expectedOutput: "3",
        order: 7,
        isHidden: true,
      },
    ],
  });

  // ─── 12. Longest Substring Without Repeating Characters ──────
  await prisma.question.upsert({
    where: { id: "longest-substring-no-repeat" },
    update: {},
    create: {
      id: "longest-substring-no-repeat",
      title: "Longest Substring Without Repeating Characters",
      statement: `
Given a string \`s\`, find the length of the **longest substring** without repeating characters.

**Input:** A single string \`s\`.
**Output:** Print the length of the longest substring without repeating characters.
      `,
      difficulty: Difficulty.MEDIUM,
      examples: [
        {
          input: 's = "abcabcbb"',
          output: "3",
          explanation: 'The answer is "abc", with the length of 3.',
        },
        {
          input: 's = "bbbbb"',
          output: "1",
          explanation: 'The answer is "b", with the length of 1.',
        },
        {
          input: 's = "pwwkew"',
          output: "3",
          explanation:
            'The answer is "wke", with the length of 3. Note that "pwke" is a subsequence, not a substring.',
        },
      ],
      constraints: `
- 0 ≤ s.length ≤ 5 × 10⁴
- s consists of English letters, digits, symbols and spaces.
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "longest-substring-no-repeat",
        input: "abcabcbb",
        expectedOutput: "3",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "longest-substring-no-repeat",
        input: "bbbbb",
        expectedOutput: "1",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "longest-substring-no-repeat",
        input: "pwwkew",
        expectedOutput: "3",
        order: 3,
        isHidden: false,
      },
      {
        questionId: "longest-substring-no-repeat",
        input: "dvdf",
        expectedOutput: "3",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "longest-substring-no-repeat",
        input: "abcdefg",
        expectedOutput: "7",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "longest-substring-no-repeat",
        input: "aab",
        expectedOutput: "2",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "longest-substring-no-repeat",
        input: "a",
        expectedOutput: "1",
        order: 7,
        isHidden: true,
      },
    ],
  });

  // ─── 13. Container With Most Water ───────────────────────────
  await prisma.question.upsert({
    where: { id: "container-with-most-water" },
    update: {},
    create: {
      id: "container-with-most-water",
      title: "Container With Most Water",
      statement: `
You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

**Input:** Space-separated integers representing the heights.
**Output:** Print the maximum area.
      `,
      difficulty: Difficulty.MEDIUM,
      examples: [
        {
          input: "height = [1,8,6,2,5,4,8,3,7]",
          output: "49",
          explanation:
            "The lines at index 1 (height 8) and index 8 (height 7) form a container with area min(8,7) * (8-1) = 49.",
        },
        {
          input: "height = [1,1]",
          output: "1",
          explanation: "The only container has area 1.",
        },
      ],
      constraints: `
- 2 ≤ height.length ≤ 10⁵
- 0 ≤ height[i] ≤ 10⁴
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "container-with-most-water",
        input: "1 8 6 2 5 4 8 3 7",
        expectedOutput: "49",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "container-with-most-water",
        input: "1 1",
        expectedOutput: "1",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "container-with-most-water",
        input: "4 3 2 1 4",
        expectedOutput: "16",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "container-with-most-water",
        input: "1 2 1",
        expectedOutput: "2",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "container-with-most-water",
        input: "2 3 10 5 7 8 9",
        expectedOutput: "36",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "container-with-most-water",
        input: "1 3 2 5 25 24 5",
        expectedOutput: "24",
        order: 6,
        isHidden: true,
      },
    ],
  });

  // ─── 14. Product of Array Except Self ────────────────────────
  await prisma.question.upsert({
    where: { id: "product-except-self" },
    update: {},
    create: {
      id: "product-except-self",
      title: "Product of Array Except Self",
      statement: `
Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in \`O(n)\` time and **without using the division operation**.

**Input:** Space-separated integers representing the array.
**Output:** Space-separated integers representing the result.
      `,
      difficulty: Difficulty.MEDIUM,
      examples: [
        {
          input: "nums = [1,2,3,4]",
          output: "[24,12,8,6]",
          explanation:
            "answer[0] = 2*3*4 = 24, answer[1] = 1*3*4 = 12, answer[2] = 1*2*4 = 8, answer[3] = 1*2*3 = 6.",
        },
        {
          input: "nums = [-1,1,0,-3,3]",
          output: "[0,0,9,0,0]",
          explanation: "Any product including the 0 element becomes 0.",
        },
      ],
      constraints: `
- 2 ≤ nums.length ≤ 10⁵
- -30 ≤ nums[i] ≤ 30
- The product of any prefix or suffix of nums fits in a 32-bit integer.
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "product-except-self",
        input: "1 2 3 4",
        expectedOutput: "24 12 8 6",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "product-except-self",
        input: "-1 1 0 -3 3",
        expectedOutput: "0 0 9 0 0",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "product-except-self",
        input: "2 3",
        expectedOutput: "3 2",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "product-except-self",
        input: "1 1 1 1",
        expectedOutput: "1 1 1 1",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "product-except-self",
        input: "0 0",
        expectedOutput: "0 0",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "product-except-self",
        input: "2 3 4 5",
        expectedOutput: "60 40 30 24",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "product-except-self",
        input: "-1 -1 -1",
        expectedOutput: "1 1 1",
        order: 7,
        isHidden: true,
      },
    ],
  });

  // ─── 15. Rotate Array ────────────────────────────────────────
  await prisma.question.upsert({
    where: { id: "rotate-array" },
    update: {},
    create: {
      id: "rotate-array",
      title: "Rotate Array",
      statement: `
Given an integer array \`nums\`, rotate the array to the right by \`k\` steps.

**Input:**
- Line 1: space-separated integers representing the array.
- Line 2: the integer \`k\`.

**Output:** Print the space-separated rotated array.
      `,
      difficulty: Difficulty.MEDIUM,
      examples: [
        {
          input: "nums = [1,2,3,4,5,6,7], k = 3",
          output: "[5,6,7,1,2,3,4]",
          explanation:
            "Rotate 1 step: [7,1,2,3,4,5,6]. Rotate 2 steps: [6,7,1,2,3,4,5]. Rotate 3 steps: [5,6,7,1,2,3,4].",
        },
        {
          input: "nums = [-1,-100,3,99], k = 2",
          output: "[3,99,-1,-100]",
          explanation:
            "Rotate 1 step: [99,-1,-100,3]. Rotate 2 steps: [3,99,-1,-100].",
        },
      ],
      constraints: `
- 1 ≤ nums.length ≤ 10⁵
- -2³¹ ≤ nums[i] ≤ 2³¹ - 1
- 0 ≤ k ≤ 10⁵
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "rotate-array",
        input: "1 2 3 4 5 6 7\n3",
        expectedOutput: "5 6 7 1 2 3 4",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "rotate-array",
        input: "-1 -100 3 99\n2",
        expectedOutput: "3 99 -1 -100",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "rotate-array",
        input: "1 2\n3",
        expectedOutput: "2 1",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "rotate-array",
        input: "1\n0",
        expectedOutput: "1",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "rotate-array",
        input: "1 2 3\n0",
        expectedOutput: "1 2 3",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "rotate-array",
        input: "1 2 3 4 5\n5",
        expectedOutput: "1 2 3 4 5",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "rotate-array",
        input: "1 2 3 4 5 6\n2",
        expectedOutput: "5 6 1 2 3 4",
        order: 7,
        isHidden: true,
      },
    ],
  });

  // ─── 16. Trapping Rain Water ─────────────────────────────────
  await prisma.question.upsert({
    where: { id: "trapping-rain-water" },
    update: {},
    create: {
      id: "trapping-rain-water",
      title: "Trapping Rain Water",
      statement: `
Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

**Input:** Space-separated non-negative integers representing the elevation map.
**Output:** Print the total amount of trapped water.
      `,
      difficulty: Difficulty.HARD,
      examples: [
        {
          input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
          output: "6",
          explanation: "The elevation map traps 6 units of rain water.",
        },
        {
          input: "height = [4,2,0,3,2,5]",
          output: "9",
          explanation: "The elevation map traps 9 units of rain water.",
        },
      ],
      constraints: `
- 1 ≤ n ≤ 2 × 10⁴
- 0 ≤ height[i] ≤ 10⁵
      `,
    },
  });

  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        questionId: "trapping-rain-water",
        input: "0 1 0 2 1 0 1 3 2 1 2 1",
        expectedOutput: "6",
        order: 1,
        isHidden: false,
      },
      {
        questionId: "trapping-rain-water",
        input: "4 2 0 3 2 5",
        expectedOutput: "9",
        order: 2,
        isHidden: false,
      },
      {
        questionId: "trapping-rain-water",
        input: "1 2 3 4 5",
        expectedOutput: "0",
        order: 3,
        isHidden: true,
      },
      {
        questionId: "trapping-rain-water",
        input: "5 4 3 2 1",
        expectedOutput: "0",
        order: 4,
        isHidden: true,
      },
      {
        questionId: "trapping-rain-water",
        input: "3 0 3",
        expectedOutput: "3",
        order: 5,
        isHidden: true,
      },
      {
        questionId: "trapping-rain-water",
        input: "0",
        expectedOutput: "0",
        order: 6,
        isHidden: true,
      },
      {
        questionId: "trapping-rain-water",
        input: "5 2 1 2 1 5",
        expectedOutput: "14",
        order: 7,
        isHidden: true,
      },
    ],
  });
}

async function main() {
  console.log("Seeding database...");
  await seed();
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
