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
