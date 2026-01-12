import express from "express";
import submissionRoutes from "./routes/submission.routes";
import healthRoutes from "./routes/health.routes";
import questionRoutes from "./routes/question.routes";

const app = express();

app.use(express.json());

app.use("/api/submissions", submissionRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/questions", questionRoutes);

export default app;

