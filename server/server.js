import http from "http";
import { Server } from "socket.io";
import express from "express";
import reviewCode from "./ai.js";
import connectDB from "./db.js";
import ReviewModel from "./models/Review.js";
import CommentModel from "./models/Comment.js";
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

  server.listen(3000, () => {
    console.log("Server Started from server.listen!");
  });
};

// GET routes
app.get("/reviews", async (req, res) => {
  try {
    const data = await ReviewModel.find();
    res.status(200).json(data);
  } catch (error) {
    console.log("GET request to /reviews has failed: Error\n", error);
    return res.status(500).json({
      error: "Couldn't fetch the resource requested.",
    });
  }
});

app.get("/reviews/:id", async (req, res) => {
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

app.get("/reviews/:id/comments", async (req, res) => {
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

// Post Routes
app.post("/reviews", async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({
      error: "invalid or incomplete input recieved",
    });
  }

  try {
    const response = await reviewCode(code, language);

    const savedResponse = await ReviewModel.create({
      code,
      language,
      codeReview: response,
    });
    io.emit("new-review", savedResponse);
    res.status(201).json(savedResponse);
  } catch (error) {
    console.log("An error occured in getting a response ", error);
    return res.status(500).json({
      Error: "Something went wrong from the server side.",
    });
  }
});

app.post("/reviews/:id/comments", async (req, res) => {
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
