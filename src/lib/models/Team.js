import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email"],
  },
});

const teamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    leader: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    score: { type: Number, default: 0 },
    solvedChallenges: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
      set: (arr) => [...new Set(arr.map(String))],
    },

    members: {
      type: [memberSchema],
      validate: {
        validator: function (val) {
          return val.length >= 0 && val.length <= 4;
        },
        message: "Team can have between 0 and 4 members.",
      },
    },
  },
  { timestamps: true }
);

teamSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

teamSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Team || mongoose.model("Team", teamSchema);
