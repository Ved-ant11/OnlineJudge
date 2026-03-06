import "dotenv/config";
import express from "express";
import submissionRoutes from "./routes/submission.routes";
import healthRoutes from "./routes/health.routes";
import questionRoutes from "./routes/question.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import reviewRoutes from "./routes/review.routes";
import battleRoutes from "./routes/battle.routes";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/submissions", submissionRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/battle", battleRoutes);

export default app;

