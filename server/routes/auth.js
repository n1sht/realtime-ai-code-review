import { Router } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../lib/validators.js";
import logger from "../lib/logger.js";

const router = Router();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/signup", validate(signupSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await UserModel.create({ email, password, name });
    const token = generateToken(user._id);
    logger.info("User signed up", { userId: user._id });
    res.status(201).json({ token, user: { _id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user._id);
    logger.info("User logged in", { userId: user._id });
    res.status(200).json({ token, user: { _id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
