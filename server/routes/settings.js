import { Router } from "express";
import UserModel from "../models/User.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { settingsSchema, fetchModelsSchema } from "../lib/validators.js";
import logger from "../lib/logger.js";

const router = Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId).select("customEndpoint customApiKey customModel");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({
      customEndpoint: user.customEndpoint,
      customApiKey: user.customApiKey,
      customModel: user.customModel,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/", auth, validate(settingsSchema), async (req, res, next) => {
  try {
    const { customEndpoint, customApiKey, customModel } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { customEndpoint, customApiKey, customModel },
      { new: true }
    ).select("customEndpoint customApiKey customModel");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({
      customEndpoint: user.customEndpoint,
      customApiKey: user.customApiKey,
      customModel: user.customModel,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/upgrade", auth, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isPro = true;
    await user.save();
    logger.info("User upgraded to Pro", { userId: req.userId });
    res.json({ message: "Successfully upgraded to Pro" });
  } catch (err) {
    next(err);
  }
});

router.post("/fetch-models", auth, validate(fetchModelsSchema), async (req, res, next) => {
  try {
    const { endpoint, apiKey } = req.body;
    const modelsUrl = endpoint.replace(/\/chat\/completions\/?$/, "/models");
    const response = await fetch(modelsUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(400).json({ error: errData.error?.message || `HTTP ${response.status}` });
    }

    const data = await response.json();
    const modelsList = data.data || data || [];
    const seen = new Set();
    const models = [];
    for (const m of modelsList) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        models.push({ id: m.id, name: m.name || m.id });
      }
    }
    res.status(200).json({ models });
  } catch (err) {
    next(err);
  }
});

export default router;
