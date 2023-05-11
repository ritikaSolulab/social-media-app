import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      index: {unique: true},
    },
    followers: [{ type:String}],
    following: [{ type:String}],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status:{
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public'
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
