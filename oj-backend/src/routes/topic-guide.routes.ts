import { Router, Request, Response } from "express";
import { topicGuides, topicGuideMap } from "../../data/topics";

const router = Router();

// GET /api/topics
// Returns list of all topic guides (summary only — id, name, icon, prerequisites)
router.get("/", (_req: Request, res: Response) => {
  const summaries = topicGuides.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    prerequisites: g.prerequisites,
  }));

  return res.status(200).json({ topics: summaries });
});

// GET /api/topics/:id
// Returns the full topic guide for a given id
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const guide = topicGuideMap.get(id);

  if (!guide) {
    return res.status(404).json({ error: "Topic guide not found" });
  }

  return res.status(200).json(guide);
});

export default router;
