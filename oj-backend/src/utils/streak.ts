import prisma from "../db/client";

export const updateStreak = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) return;
    const now = new Date();
    const todayMillis = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const today = new Date(todayMillis); // e.g., 2026-03-02T00:00:00.000Z

    //upsert DailyActivity for the Heatmap
    await prisma.dailyActivity.upsert({
        where: {
            userId_date: {
                userId,
                date: today,
            }
        },
        update: {
            count: { increment: 1 }
        },
        create: {
            userId,
            date: today,
            count: 1
        }
    });

    //Streak calculation
    let newCurrentStreak = user.currentStreak;
    let newMaxStreak = user.maxStreak;

    if (user.lastActivityDate) {
        // Normalize the last activity date to midnight UTC just to be safe
        const lastMillis = Date.UTC(
            user.lastActivityDate.getUTCFullYear(), 
            user.lastActivityDate.getUTCMonth(), 
            user.lastActivityDate.getUTCDate()
        );
        
        // Math.round is safer here after timezone normalization
        const diffDays = Math.round((todayMillis - lastMillis) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Solved yesterday -> increment streak
            newCurrentStreak++;
            newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);
        } else if (diffDays > 1) {
            // Missed a day -> reset streak to 1
            newCurrentStreak = 1;
        }
        // If diffDays === 0, it means they already solved one today. Do nothing to the streak.
    } else {
        // First ever submission
        newCurrentStreak = 1;
        newMaxStreak = Math.max(newMaxStreak, 1);
    }
    //Update the User model
    if (newCurrentStreak !== user.currentStreak || !user.lastActivityDate || user.lastActivityDate.getTime() !== today.getTime()) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak: newCurrentStreak,
                maxStreak: newMaxStreak,
                lastActivityDate: today,
            },
        });
    }
};