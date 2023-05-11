import mongoose, {Types} from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
        type: Types.ObjectId,
        required: true,
        ref:'User',
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
  },
  { timestamps: true }
);

export const TokenModel = mongoose.model("Token", tokenSchema);
