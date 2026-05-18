import { Router } from "express";
import reviewCode from "../ai.js";
import ReviewModel from "../models/Review.js";
import CommentModel from "../models/Comment.js";
import UserModel from "../models/User.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { reviewSchema, commentSchema } from "../lib/validators.js";
import logger from "../lib/logger.js";

const router = Router();

export default function createReviewRoutes(io) {
  router.get("/", auth, async (req, res, next) => {
    try {
      const data = await ReviewModel.find({ userId: req.userId }).sort({ createdAt: -1 });
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", auth, async (req, res, next) => {
    try {
      const data = await ReviewModel.findById(req.params.id);
      if (!data) return res.status(404).json({ error: "Review not found" });
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  router.post("/", auth, validate(reviewSchema), async (req, res, next) => {
    try {
      const { code, language } = req.body;
      const user = await UserModel.findById(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!user.customApiKey || !user.customEndpoint) {
        if (!user.isPro && new Date() > new Date(user.trialEndsAt)) {
          return res.status(403).json({
            error: "Your 5-day trial has expired. Please upgrade to Pro or configure your own API key in Settings.",
          });
        }
      }

      const customConfig = {};
      if (user.customEndpoint) customConfig.endpoint = user.customEndpoint;
      if (user.customApiKey) customConfig.apiKey = user.customApiKey;
      if (user.customModel) customConfig.model = user.customModel;

      const response = await reviewCode(code, language, customConfig);
      const savedResponse = await ReviewModel.create({
        userId: req.userId,
        code,
        language,
        codeReview: response.raw,
        issues: response.issues,
      });

      io.emit("new-review", savedResponse);
      logger.info("Review created", { reviewId: savedResponse._id, userId: req.userId });
      res.status(201).json(savedResponse);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id/comments", auth, async (req, res, next) => {
    try {
      const comments = await CommentModel.find({ reviewId: req.params.id });
      res.status(200).json(comments);
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/comments", auth, validate(commentSchema), async (req, res, next) => {
    try {
      const review = await ReviewModel.findById(req.params.id);
      if (!review) return res.status(404).json({ error: "Review not found" });

      const savedComment = await CommentModel.create({
        reviewId: req.params.id,
        name: req.body.name,
        comment: req.body.comment,
      });

      io.to(`review-${req.params.id}`).emit("new-comment", savedComment);
      res.status(201).json(savedComment);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
