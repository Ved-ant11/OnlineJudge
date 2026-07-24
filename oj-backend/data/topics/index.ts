import fs from "fs";
import path from "path";

export type Resource = {
  title: string;
  url: string;
  type: "article" | "video" | "visualizer" | "course" | "book";
  why: string;
};

export type ThinkingStep = {
  step: string;
  detail: string;
};

export type Trap = {
  trap: string;
  howToAvoid: string;
};

export type TopicGuide = {
  id: string;
  name: string;
  icon: string;
  prerequisites: string[];
  coreIntuition: string;
  mentalModel: string;
  whenToUse: string[];
  thinkingFramework: ThinkingStep[];
  commonTraps: Trap[];
  interviewVariantStrategy: string;
  resources: Resource[];
};

const dir = path.join(process.cwd(), "data/topics");

const guideFiles = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"));

export const topicGuides: TopicGuide[] = guideFiles
  .map(
    (f) =>
      JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as TopicGuide
  )
  .sort((a, b) => a.name.localeCompare(b.name));

export const topicGuideMap = new Map<string, TopicGuide>(
  topicGuides.map((g) => [g.id, g])
);
