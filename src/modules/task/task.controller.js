import { tasksModel } from "../../../database/models/tasks.model.js";
import { userModel } from "../../../database/models/user.model.js";
import cloudinary from "../../../utils/cloudnairyConfig.js";

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

//** new **  qr code of oneUser with user data
export const taskQrCode = async (req, res, next) => {
  const { _id } = req.authUser;

  const tasks = await tasksModel.find({ userId: _id }).populate("assignTo");

  if (!tasks) {
    return res.status(400).json({ message: "Tasks don't exist" });
  }

  const qrcode = await generateQrCode({
    data: [{ id: user._id }, { tasks }],
  });
  res.status(200).json({ message: "Done", qrcode });
};

//**new ** upload one task picture
export const uploadTaskPic = async (req, res, next) => {
  const { _id } = req.params;
  if (!req.file) {
    return next(new Error("please upload a profile picture", { cause: 400 }));
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Tasks/Pictures/${req.params._id}`,
      unique_filename: false,
      resource_type: "image",
    }
  );

  const task = await tasksModel.findByIdAndUpdate(
    _id,
    { taskPic: { public_id, secure_url } },
    { new: true }
  );

  if (!task) {
    await cloudinary.uploader.destroy(public_id);
  }
  res.status(200).json({ message: "done", task });
};



//**new ** upload one task cover picture
export const uploadTaskCoverPic = async (req, res, next) => {
  const { _id } = req.params;
  if (!req.file) {
    return next(new Error("please upload a cover picture", { cause: 400 }));
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Tasks/Covers/${req.params._id}`,
      unique_filename: false,
      resource_type: "image",
    }
  );

  const task = await tasksModel.findByIdAndUpdate(
    _id,
    { taskCoverPic: { public_id, secure_url } },
    { new: true }
  );

  if (!task) {
    await cloudinary.uploader.destroy(public_id);
  }
  res.status(200).json({ message: "done", task });
};

//**new ** upload bulk task picture
export const bulkTaskPics = async (req, res, next) => {
  const { _id } = req.params;
  let bulkPictures = req.files;
  if (!bulkPictures) {
    return next(new Error("no picture attached", { cause: 400 }));
  }
  let uploadPromise = bulkPictures.map(async (picture) => {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      picture.path,
      {
        folder: `Tasks/Profiles/${req.params._id}`,
        unique_filename: false,
        resource_type: "image",
      }
    );
    return { public_id, secure_url };
  });
  let uploadResponse = await Promise.all(uploadPromise);

  const task = await tasksModel.findById(
    _id,
    { taskPic: uploadResponse },
    { new: true }
  );

  if (!task) {
    uploadResponse.forEach(async (pic) => {
      await cloudinary.uploader.destroy(pic.public_id);
    });

   return res.status(400).json({ message: "task is not found" });
  }
  res.status(200).json({ message: "done", task });
};

//** new ** delete one picture
export const deleteOnePic = async (req, res, next) => {
  const { public_id } = req.body;
  if (!public_id ) {
    return res.status(400).json({ message: "Invalid public_id" });
  }
  const result = await cloudinary.uploader.destroy(public_id);
  console.log(result);

  if (result.result == "not found") {
    return res.status(400).json({ message: "picture not found" });
  }

  res.status(200).json({ message: "picture deleted", result });
};

//** new ** delete many pictures
export const deleteManyPics = async (req, res, next) => {
  const toDeletePics = req.body.publicIDs;

  if (!toDeletePics || !Array.isArray(toDeletePics)) {
    return res.status(400).json({ message: "Invalid public_id" });
  }
  try {
    const deleteResults = [];

    for (const publicID of toDeletePics) {
      try {
        await cloudinary.api.resource(publicID);
        deleteResults.push(publicID);
      } catch (error) {
        console.log(`Image not found for publicID: ${publicID}`);
        deleteResults.push(publicID);
      }
    }
    const deletedPublicIDs = await cloudinary.api.delete_resources(
      deleteResults
    );

    res.status(200).json({ message: "pictures deleted", deletedPublicIDs });
  } catch (error) {
    console.log(error);
  }
};
//** new **delete folder
export const deleteFolder = async (req, res, next) => {
  const { folder } = req.body;

  if (!folder) {
    return res.status(400).json({ message: "Invalid folder " });
  }

  try {
    await cloudinary.api.delete_resources_by_prefix(folder);
    const result = await cloudinary.api.delete_folder(folder);
    res.status(200).json({ message: "Folder deleted", result });
  } catch (error) {
    console.log(error);

    return res.status(400).json({ message: error.error.message });
  }
};
//** new **delete all images in  a folder
export const deleteAllImages = async (req, res, next) => {
  const { folder } = req.body;

  if (!folder) {
    return res.status(400).json({ message: "Invalid folder " });
  }

  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folder);
    console.log(result)
    res.status(200).json({ message: "images deleted", result });
  } catch (error) {
    console.log(error);
  }
};
