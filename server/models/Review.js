import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    codeReview: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const ReviewModel = mongoose.model("ReviewModel", ReviewSchema);

export default ReviewModel;
