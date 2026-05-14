import http from "http";
import { Server } from "socket.io";
import express from "express";
import jwt from "jsonwebtoken";
import reviewCode from "./ai.js";
import connectDB from "./db.js";
import ReviewModel from "./models/Review.js";
import CommentModel from "./models/Comment.js";
import UserModel from "./models/User.js";
import auth from "./middleware/auth.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });

  socket.on("join-review", (_id) => {
    socket.join(`review-${_id}`);
    console.log(`user ${socket.id} has joined the room review-${_id}`);
  });

  socket.on("leave-review", (_id) => {
    socket.leave(`review-${_id}`);
    console.log(`user ${socket.id} has left the room review-${_id}`);
  });
});

const startServer = async () => {
  await connectDB();

  server.listen(3001, () => {
    console.log("Server Started from server.listen!");
  });
};

app.post("/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await UserModel.create({ email, password, name });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log("Signup error:", error);
    return res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

app.get("/auth/me", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Auth me error:", error);
    return res.status(500).json({ error: "Failed to get user" });
  }
});

app.get("/settings", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select(
      "customEndpoint customApiKey customModel",
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      customEndpoint: user.customEndpoint,
      customApiKey: user.customApiKey,
      customModel: user.customModel,
    });
  } catch (error) {
    console.log("Get settings error:", error);
    return res.status(500).json({ error: "Failed to get settings" });
  }
});

app.post("/settings/upgrade", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    user.isPro = true;
    await user.save();
    
    res.json({ message: "Successfully upgraded to Pro" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/settings", auth, async (req, res) => {
  const { customEndpoint, customApiKey, customModel } = req.body;

  try {
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { customEndpoint, customApiKey, customModel },
      { new: true },
    ).select("customEndpoint customApiKey customModel");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      customEndpoint: user.customEndpoint,
      customApiKey: user.customApiKey,
      customModel: user.customModel,
    });
  } catch (error) {
    console.log("Update settings error:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
});

app.post("/settings/fetch-models", auth, async (req, res) => {
  const { endpoint, apiKey } = req.body;
  if (!endpoint || !apiKey) {
    return res.status(400).json({ error: "Endpoint and API key are required" });
  }

  try {
    const modelsUrl = endpoint.replace(/\/chat\/completions\/?$/, "/models");
    const response = await fetch(modelsUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const modelsList = data.data || data || [];
    const uniqueModels = [];
    const seen = new Set();
    for (const m of modelsList) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        uniqueModels.push({ id: m.id, name: m.name || m.id });
      }
    }

    res.status(200).json({ models: uniqueModels });
  } catch (error) {
    console.log("Fetch models error:", error);
    return res.status(400).json({ error: error.message || "Failed to fetch models" });
  }
});

app.get("/reviews", auth, async (req, res) => {
  try {
    const data = await ReviewModel.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    console.log("GET request to /reviews has failed: Error\n", error);
    return res.status(500).json({
      error: "Couldn't fetch the resource requested.",
    });
  }
});

app.get("/reviews/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const data = await ReviewModel.findById(id);
    if (!data) {
      return res.status(404).json({
        error: "No such id exist",
      });
    }
    res.status(200).json(data);
  } catch (error) {
    console.log("GET request to /reviews/id has failed: Error\n", error);
    return res.status(500).json({
      error: "Couldn't fetch the resource requested.",
    });
  }
});

app.get("/reviews/:id/comments", auth, async (req, res) => {
  const reviewId = req.params.id;
  try {
    const commentsOnReview = await CommentModel.find({ reviewId });

    return res.status(200).json(commentsOnReview);
  } catch (error) {
    console.log(
      "GET request to /reviews/:id/comments has failed: Error\n",
      error,
    );
    return res.status(500).json({
      error: "Couldn't fetch the resource requested.",
    });
  }
});

app.post("/reviews", auth, async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({
      error: "invalid or incomplete input recieved",
    });
  }

  try {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.customApiKey || !user.customEndpoint) {
      if (!user.isPro && new Date() > new Date(user.trialEndsAt)) {
        return res.status(403).json({
          error: "Your 5-day trial has expired. Please upgrade to Pro or configure your own API key in Settings."
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
      codeReview: response,
    });
    io.emit("new-review", savedResponse);
    res.status(201).json(savedResponse);
  } catch (error) {
    console.log("An error occured in getting a response ", error);
    return res.status(500).json({
      error: error.message || "Something went wrong from the server side.",
    });
  }
});

app.post("/reviews/:id/comments", auth, async (req, res) => {
  const reviewId = req.params.id;
  const { name, comment } = req.body;

  if (!name || !comment) {
    return res.status(400).json({
      error: "invalid or incomplete input recieved",
    });
  }

  try {
    const data = await ReviewModel.findById(reviewId);
    if (!data) {
      return res.status(404).json({
        error: "No such review exist",
      });
    }

    const savedComment = await CommentModel.create({
      reviewId,
      name,
      comment,
    });

    io.to(`review-${reviewId}`).emit("new-comment", savedComment);

    res.status(201).json(savedComment);
  } catch (error) {
    console.log("Error in post /comments");
    return res.status(500).json({
      Error: "Something went wrong from the server side.",
    });
  }
});

startServer();
