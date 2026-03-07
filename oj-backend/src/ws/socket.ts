import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { createClient } from "redis";
import { judgeSubmission } from "../worker/judge";
import prisma from "../db/client";
import { Verdict } from "../generated/prisma/client";


export function setupWebSocket(server: Server) {
    const wss = new WebSocketServer({ server });
    const clients = new Map<string, WebSocket>();
    const battleRooms = new Map<string,{
        player1: WebSocket | null,
        player2: WebSocket | null,
        timer: NodeJS.Timeout | null,
        startTime: number,
        duration: number,
    }>();
    wss.on("connection", (ws) => {
        console.log("Client connected");
        ws.on("message", async (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === "battle:join") {
                const { battleId, userId } = message;
                let room = battleRooms.get(battleId);

                if (!room) {
                    battleRooms.set(battleId, {
                        player1: ws,
                        player2: null,
                        timer: null,
                        startTime: 0,
                        duration: 1200000, 
                    });
                    ws.send(JSON.stringify({ type: "battle:waiting", battleId }));
                } else if (!room.player2) {
                    room.player2 = ws;

                    const countdown = JSON.stringify({ type: "battle:countdown", seconds: 3 });
                    room.player1?.send(countdown);
                    room.player2.send(countdown);
                    setTimeout(() => {
                        const now = Date.now();
                        room!.startTime = now;
                        const startMsg = JSON.stringify({
                            type: "battle:start",
                            battleId,
                            startTime: now,
                            duration: room!.duration,
                        });
                        room!.player1?.send(startMsg);
                        room!.player2?.send(startMsg);

                        room!.timer = setTimeout(() => {
                            const timeoutMsg = JSON.stringify({ type: "battle:timeout", battleId });
                            room!.player1?.send(timeoutMsg);
                            room!.player2?.send(timeoutMsg);
                        }, room!.duration);
                    }, 3000);
                }
            }
            
            if (message.type === "battle:submit") {
                const { battleId, userId, code, language } = message;
                const room = battleRooms.get(battleId);
                if (!room) return;

                const isPlayer1 = room.player1 === ws;
                const opponent = isPlayer1 ? room.player2 : room.player1;

                const battle = await prisma.battle.findUnique({
                    where: { id: battleId },
                    select: { questionId: true, player1Id: true, player2Id: true },
                });
                if (!battle) return;

                const testCases = await prisma.testCase.findMany({
                    where: { questionId: battle.questionId },
                    orderBy: { order: "asc" },
                });

                const result = await judgeSubmission({ language, code, testCases });

                if (result.verdict === Verdict.AC) {
                    const timeTaken = Date.now() - room.startTime;
                    if (room.timer) clearTimeout(room.timer);
                    const loserId = isPlayer1 ? battle.player2Id : battle.player1Id;
                    await prisma.battle.update({
                        where: { id: battleId },
                        data: {
                            status: "COMPLETED",
                            winnerId: userId,
                            [isPlayer1 ? "player1Time" : "player2Time"]: timeTaken,
                        },
                    });

                    // Calculate and update Elo
                    const { calculateNewRating } = await import("../utils/elo");
                    const [winner, loser] = await Promise.all([
                        prisma.user.findUnique({ where: { id: userId } }),
                        prisma.user.findUnique({ where: { id: loserId } }),
                    ]);

                    if (winner && loser) {
                        const { winnerNew, loserNew } = calculateNewRating(
                            winner.rating, loser.rating,
                            winner.battlesPlayed, loser.battlesPlayed
                        );

                        await Promise.all([
                            prisma.user.update({
                                where: { id: winner.id },
                                data: { rating: winnerNew, battlesPlayed: { increment: 1 }, battlesWon: { increment: 1 } },
                            }),
                            prisma.user.update({
                                where: { id: loser.id },
                                data: { rating: loserNew, battlesPlayed: { increment: 1 } },
                            }),
                        ]);

                        // Notify winner
                        ws.send(JSON.stringify({
                            type: "battle:result",
                            battleId,
                            won: true,
                            timeTaken,
                            eloChange: winnerNew - winner.rating,
                            newRating: winnerNew,
                        }));

                        opponent?.send(JSON.stringify({
                            type: "battle:result",
                            battleId,
                            won: false,
                            eloChange: loserNew - loser.rating,
                            newRating: loserNew,
                        }));
                    }
                    battleRooms.delete(battleId);
                } else {
                    ws.send(JSON.stringify({
                        type: "battle:verdict",
                        verdict: result.verdict,
                        message: result.message,
                    }));

                    opponent?.send(JSON.stringify({
                        type: "battle:opponent_submitted",
                        verdict: result.verdict,
                    }));
                }
            }

            if (message.type === "battle:leave") {
                const { battleId, userId } = message;
                const room = battleRooms.get(battleId);
                if (!room) return;

                if (room.timer) clearTimeout(room.timer);

                const isPlayer1 = room.player1 === ws;
                const opponent = isPlayer1 ? room.player2 : room.player1;

                const battle = await prisma.battle.findUnique({
                    where: { id: battleId },
                    select: { player1Id: true, player2Id: true },
                });
                if (!battle) return;

                const winnerId = isPlayer1 ? battle.player2Id : battle.player1Id;

                await prisma.battle.update({
                    where: { id: battleId },
                    data: { status: "ABANDONED", winnerId },
                });

                // Elo update for forfeit
                const { calculateNewRating } = await import("../utils/elo");
                const [winner, loser] = await Promise.all([
                    prisma.user.findUnique({ where: { id: winnerId } }),
                    prisma.user.findUnique({ where: { id: userId } }),
                ]);

                if (winner && loser) {
                    const { winnerNew, loserNew } = calculateNewRating(
                        winner.rating, loser.rating,
                        winner.battlesPlayed, loser.battlesPlayed
                    );

                    await Promise.all([
                        prisma.user.update({
                            where: { id: winner.id },
                            data: { rating: winnerNew, battlesPlayed: { increment: 1 }, battlesWon: { increment: 1 } },
                        }),
                        prisma.user.update({
                            where: { id: loser.id },
                            data: { rating: loserNew, battlesPlayed: { increment: 1 } },
                        }),
                    ]);

                    opponent?.send(JSON.stringify({
                        type: "battle:result",
                        battleId,
                        won: true,
                        eloChange: winnerNew - winner.rating,
                        newRating: winnerNew,
                        reason: "opponent_left",
                    }));
                }

                battleRooms.delete(battleId);
            }

            if (message.type === "battle:hint") {
                const { battleId, userId } = message;
                const room = battleRooms.get(battleId);
                if (!room) return;

                const isPlayer1 = room.player1 === ws;
                const opponent = isPlayer1 ? room.player2 : room.player1;
                const hintField = isPlayer1 ? "player1Hints" : "player2Hints";

                const battle = await prisma.battle.findUnique({
                    where: { id: battleId },
                    select: { questionId: true, player1Hints: true, player2Hints: true },
                });
                if (!battle) return;

                const currentHints = isPlayer1 ? battle.player1Hints : battle.player2Hints;
                if (currentHints >= 3) {
                    ws.send(JSON.stringify({ type: "battle:hint_denied", reason: "No hints remaining" }));
                    return;
                }

                const { getHintsForQuestion, getHintPenalty } = await import("../battle/hints");
                const hints = await getHintsForQuestion(battle.questionId);
                const penalty = getHintPenalty(currentHints);

                room.duration -= penalty;

                await prisma.battle.update({
                    where: { id: battleId },
                    data: { [hintField]: { increment: 1 } },
                });

                ws.send(JSON.stringify({
                    type: "battle:hint",
                    hint: hints[currentHints],
                    hintNumber: currentHints + 1,
                    penaltyMs: penalty,
                    remainingHints: 2 - currentHints,
                }));

                opponent?.send(JSON.stringify({
                    type: "battle:opponent_hint",
                    hintNumber: currentHints + 1,
                }));
            }
            if (message.type === "subscribe") {
                clients.set(message.submissionId, ws);
                console.log(`Subscribed to submission ${message.submissionId}`);
                const subscriber = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
                await subscriber.connect();
                await subscriber.subscribe(`verdict:${message.submissionId}`, (msg) => {
                    ws.send(msg);
                    subscriber.unsubscribe();
                    subscriber.quit();
                });
            }
        });
        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });
}