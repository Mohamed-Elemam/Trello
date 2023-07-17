import { Router } from "express";
import * as tc from "./task.controller.js";
import { errorHandling } from "../../../utils/errorhandling.js";
import { auth } from "./../middlewares/auth.js";

const router = Router();

// 1-add task with status (toDo)(user must be logged in)
router.post("/addTask", auth, errorHandling(tc.addTask));

// 2-update task (title , description , status) and assign task to other user(user must be logged in) (creator only can update task)
router.put("/updateTask/:taskId", auth, errorHandling(tc.updateTask));

// 3-delete task(user must be logged in) (creator only can delete task)
router.delete("/deleteTask/:taskId", auth, errorHandling(tc.deleteTask));

// 4-get all tasks with user data
router.get("/getAllCreatedTasks", auth, errorHandling(tc.getAllTasks));

// 5-get tasks of oneUser with user data (user must be logged in)
router.get("/getAllAssignTasks", auth, errorHandling(tc.getUserTasks));

// 6-get all tasks that not done after deadline
router.get("/allLateTasks", auth, errorHandling(tc.unfinishedTasks));

export default router;
