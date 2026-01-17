// src/index.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import * as authController from "@/controllers/authController";
import { requireAuth } from "@/middleware/authMiddleware";
import { logger } from "@/utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // 5173 is Vite default
app.use(express.json());
app.use(cookieParser());
// Routes (placeholder)
app.post("/api/v1/auth/register", authController.handleRegister);
app.post("/api/v1/auth/login", authController.handleLogin);
app.post("/api/v1/auth/logout", authController.handleLogout);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});
app.get("/api/v1/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});
