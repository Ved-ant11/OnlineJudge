import redis from "../redis/client";
import prisma from "../db/client";

async function matchmake() {
  const queue = await redis.zRangeWithScores("matchmaking_queue", 0, -1);
  if (queue.length < 2) {
    return;
  }

  const matched = new Set<number>();

  for (let i = 0; i < queue.length - 1; i++) {
    if (matched.has(i)) continue;

    for (let j = i + 1; j < queue.length; j++) {
      if (matched.has(j)) continue;

      const score1 = queue[i].score;
      const score2 = queue[j].score;

      if (Math.abs(score1 - score2) <= 200) {
        const avgRating = (score1 + score2) / 2;
        let difficulty: "EASY" | "MEDIUM" | "HARD";
        if (avgRating < 1200) difficulty = "EASY";
        else if (avgRating < 1600) difficulty = "MEDIUM";
        else difficulty = "HARD";

        const questions = await prisma.question.findMany({
          where: { difficulty },
          select: { id: true },
        });
        if (questions.length === 0) continue;
        const randomQ = questions[Math.floor(Math.random() * questions.length)];

        await prisma.battle.create({
          data: {
            player1Id: queue[i].value,
            player2Id: queue[j].value,
            questionId: randomQ.id,
            status: "ACTIVE",
          },
        });

        await redis.zRem("matchmaking_queue", queue[i].value);
        await redis.zRem("matchmaking_queue", queue[j].value);

        matched.add(i);
        matched.add(j);
        break;
      }
    }
  }
}

export function startMatchmaker() {
  setInterval(matchmake, 2000);
}
