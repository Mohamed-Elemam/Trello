import { tasksModel } from "../../../database/models/tasks.model.js";
import { userModel } from "../../../database/models/user.model.js";

let todayDate = new Date().toISOString().slice(0, 10);
//*####
//* 1-add task with status (toDo)(user must be logged in)
//*####
export const addTask = async (req, res, next) => {
  const { _id } = req.authUser;
  const { title, description, status, userId, assignTo, deadline } = req.body;

  if (deadline < todayDate) {
    return res.status(400).json({ message: "Enter a valid date" });
  }

  const assignedTo = await userModel.findById(assignTo);
  if (!assignedTo) {
    return res.status(400).json({
      message: "The user you want to assign this task to doesn't exist.",
    });
  }

  const task = new tasksModel({
    title,
    description,
    status,
    userId: _id,
    assignTo: assignedTo,
    deadline,
  });

  await task.save();
  await task.populate("assignTo");
  res.status(200).json({ message: "Task added successfully", task });
};

//*####
//* 2-update task
//*####
export const updateTask = async (req, res, next) => {
  const { _id } = req.authUser;
  const { taskId } = req.params;

  const { title, description, deadline, status, assignTo } = req.body;

  if (deadline < todayDate) {
    return res.status(400).json({ message: "Enter a valid date" });
  }

  const assignedTo = await userModel.findById(assignTo);
  if (!assignedTo) {
    return res.status(400).json({
      message: "The user you want to assign this task to doesn't exist.",
    });
  }

  const user = await userModel.findById(_id);
  if (!user) {
    return res.status(400).json({ message: "You are not the task creator" });
  }

  // Check if the status value is valid
  if (!["toDo", "doing", "done"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const task = await tasksModel.findByIdAndUpdate(
    taskId,
    {
      title,
      description,
      deadline,
      status,
      assignTo,
    },
    { new: true }
  );

  if (!task) {
    return res.status(400).json({ message: "Task doesn't exist" });
  }

  res.status(200).json({ message: "Task updated", task });
};

//*####
//* 3-delete task(user must be logged in) (creator only can delete task)
//*####
export const deleteTask = async (req, res, next) => {
  const { _id } = req.authUser;
  const { taskId } = req.params;

  const user = await userModel.findById(_id);
  if (!user) {
    return res.status(400).json({ message: "You are not the task creator" });
  }

  const task = await tasksModel.findByIdAndDelete(taskId);
  if (!task) {
    return res.status(400).json({ message: "Task doesn't exist" });
  }

  res.status(200).json({ message: "Task deleted", task });
};

//*####
//* 4-get all tasks with user data
//*####
export const getAllTasks = async (req, res, next) => {
  const tasks = await tasksModel.find().populate("assignTo");

  if (!tasks) {
    return res.status(400).json({ message: "Tasks doesn't exist" });
  }

  res.status(200).json({ message: "Done", tasks });
};

//*####
//* 5-get tasks of oneUser with user data (user must be logged in)
//*####
export const getUserTasks = async (req, res, next) => {
  const { _id } = req.authUser;

  const tasks = await tasksModel.find({ userId: _id }).populate("assignTo");

  if (!tasks) {
    return res.status(400).json({ message: "Tasks don't exist" });
  }

  res.status(200).json({ message: "Done", tasks });
};
//*####
//* 6-get all tasks that not done after deadline
//*####
export const unfinishedTasks = async (req, res, next) => {
  const { _id } = req.authUser;

  const user = await userModel.findById(_id);
  if (!user) {
    return res.status(400).json({ message: "please sign up" });
  }
  const tasks = await tasksModel
    .find({
      userId: _id,
      deadline: { $lt: todayDate },
    })
    .populate("assignTo", "userName");

  if (!tasks) {
    return res.status(400).json({ message: "Tasks don't exist" });
  }

  res.status(200).json({ message: "Done", tasks });
};
