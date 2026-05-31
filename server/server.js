import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./db.js";
import logger from "./lib/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import settingsRoutes from "./routes/settings.js";
import createReviewRoutes from "./routes/reviews.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:3000,https://realtime-ai-code-review.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) return true;
    if (!allowedOrigin.includes("*")) return false;

    const pattern = new RegExp(
      `^${allowedOrigin.split("*").map(escapeRegex).join(".*")}$`,
    );
    return pattern.test(origin);
  });
};

const corsOptions = {
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many review requests. Please wait a minute." },
});

app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(limiter);

const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
  logger.debug("Socket connected", { id: socket.id });

  socket.on("join-review", (_id) => {
    socket.join(`review-${_id}`);
  });

  socket.on("leave-review", (_id) => {
    socket.leave(`review-${_id}`);
  });

  socket.on("disconnect", () => {
    logger.debug("Socket disconnected", { id: socket.id });
  });
});

app.use("/auth", authRoutes);
app.use("/settings", settingsRoutes);
app.use("/reviews", reviewLimiter, createReviewRoutes(io));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });
};

startServer();

export { app, server };
