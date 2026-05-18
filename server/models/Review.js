import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    number: Number,
    severity: { type: String, enum: ["critical", "warning", "suggestion"] },
    issue: String,
    line: String,
    fix: String,
  },
  { _id: false }
);

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    code: { type: String, required: true },
    language: { type: String, required: true },
    codeReview: { type: String, required: true },
    issues: { type: [IssueSchema], default: [] },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("ReviewModel", ReviewSchema);

export default ReviewModel;
