import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: { values: ["toDo", "doing", "done"] },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deadline: {
      type: Date,
    },
    taskPic: {
      public_id: String,
      secure_url: String,
    },
    taskCoverPic: { public_id: String, secure_url: String },
  },
  { timestamps: true }
);

export const tasksModel = mongoose.model("Tasks", taskSchema);
