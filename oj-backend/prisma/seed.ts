import { PrismaClient, Difficulty } from "../src/generated/prisma";

const prisma = new PrismaClient();

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
          explanation: "nums[0] + nums[1] = 9"
        }
      ],
      constraints: `
- 2 ≤ nums.length ≤ 10⁴  
- -10⁹ ≤ nums[i] ≤ 10⁹  
- -10⁹ ≤ target ≤ 10⁹
      `,
    },
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
