import { Router, Request, Response } from "express";
import prisma from "../db/client";

const router = Router();

router.get("/submissions/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Invalid submission id" });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
  });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  return res.status(200).json({
    id: submission.id,
    status: submission.status,
    result: submission.result,
  });
});

export default router;
