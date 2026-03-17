import { Router, Request, Response } from "express";
import tokenVerify from "../middleware/auth";
import prisma from "../db/client";

const router = Router();

router.post("/", tokenVerify, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = await prisma.room.create({
      data: {
        code,
        ownerId: userId,
        status: "WAITING",
        participants: {
          create: {
            userId: userId,
            isReady: false,
          }
        }
      },
    });

    return res.status(200).json({ roomId: room.id, code: room.code });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:code/join", tokenVerify, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { code } = req.params;

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: { participants: true }
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.status !== "WAITING") {
      return res.status(400).json({ error: "Room has already started or ended" });
    }

    const isParticipant = room.participants.some(p => p.userId === userId);

    if (!isParticipant) {
      await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          userId: userId,
          isReady: false,
        }
      });
    }

    return res.status(200).json({ roomId: room.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", tokenVerify, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                username: true,
                rating: true
              }
            }
          }
        },
        question: {
          select: {
            id: true,
            title: true,
            statement: true,
            examples: true,
            constraints: true,
            difficulty: true,
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const isParticipant = room.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: "Not a participant" });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
