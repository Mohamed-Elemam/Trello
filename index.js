import express from "express";

import { config } from "dotenv";
config();
import { dbConnection } from "./database/dbconnection.js";
import userRouter from "./src/modules/user/user.router.js";
import taskRouter from "./src/modules/task/task.router.js";

const app = express();
const port = process.env.PORT;

dbConnection();

app.use(express.json());

app.use("/user", userRouter);
app.use("/task", taskRouter);

app.use("*", (req, res, next) => {
  res.status(404).json({ message: "Error 404 url not found" });
});

app.use((err, req, res, next) => {
  if (err) {
    return res.status(err['cause']||500).json({ message: err.message });
  }
});

app.listen(port, () => console.log(`App is listening on port ${port}!`));
