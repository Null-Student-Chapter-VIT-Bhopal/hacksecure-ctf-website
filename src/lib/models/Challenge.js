import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    value: { type: Number, required: true },
    flag: { type: String, required: true },
    file_url: { type: String },
    visible: { type: Boolean, required: true, default: true },
    solvedBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
      set: (arr) => [...new Set(arr.map((id) => id.toString()))], // 🔥 dedupe by string form
    },
  },
  { timestamps: true }
);

export default mongoose.models.Challenge ||
  mongoose.model("Challenge", ChallengeSchema);
