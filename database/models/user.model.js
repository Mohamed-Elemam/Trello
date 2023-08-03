import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    //schema(  ,  ,  hashed ,  ,  , )
    userName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: { values: ["male", "female"] },
    },
    phone: {
      type: Number,
    },
    isOnline: {
      type: String,
      enum: { values: [true, false] },
    },
    isDeleted: {
      type: String,
      default: false,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      public_id: String,
      secure_url: String,
    },
    coverPic: { public_id: String, secure_url: String },
  },
  {
    timestamps: true,
  }
);

export const userModel = mongoose.model("User", userSchema);
