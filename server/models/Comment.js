import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewModel",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const CommentModel = mongoose.model("CommentModel", CommentSchema);

export default CommentModel;
