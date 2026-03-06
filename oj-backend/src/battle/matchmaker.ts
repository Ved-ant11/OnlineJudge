import redis from "../redis/client";
import prisma from "../db/client";

async function matchmake() {
    const queue = await redis.zRangeWithScores("matchmaking_queue", 0, -1);
    if (queue.length < 2) {
        return;
    }
    for(let i = 0; i < queue.length-1; i++){
        const score1 = queue[i].score;
        const score2 = queue[i + 1].score;

        if(Math.abs(score1 - score2) <= 200){
            const avgRating = (score1 + score2) / 2;
            let difficulty: "EASY" | "MEDIUM" | "HARD";
            if (avgRating < 1200) difficulty = "EASY";
            else if (avgRating < 1600) difficulty = "MEDIUM";
            else difficulty = "HARD";

            const questions = await prisma.question.findMany({
                    where: { difficulty },
                    select: { id: true },
                });
            if(questions.length === 0) continue;
            const randomQ = questions[Math.floor(Math.random() * questions.length)];

            const battle = await prisma.battle.create({
                data: {
                    player1Id: queue[i].value,
                    player2Id: queue[i + 1].value,
                    questionId: randomQ.id,
                },
            });
            await redis.zRem("matchmaking_queue", queue[i].value);
            await redis.zRem("matchmaking_queue", queue[i + 1].value);  
            return battle;
        }
    }
}

export function startMatchmaker() {
  setInterval(matchmake, 2000);
}
