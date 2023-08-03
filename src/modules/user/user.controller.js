import { userModel } from "../../../database/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmailService } from "../../sevices/emailConfimationService.js";
import { generateQrCode } from "../../../utils/qrCodeFunction.js";
import cloudinary from "./../../../utils/cloudnairyConfig.js";
//* 1-signUp

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, age, gender, phone } = req.body;
  if (password === cPassword) {
    const isUserExist = await userModel.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "email already exist" });
    }

    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
    const userInstance = new userModel({
      userName,
      email,
      password: hashedPassword,
      age,
      gender,
      phone,
      isDeleted: false,
      isOnline: false,
    });
    await userInstance.save();

    const cofirmToken = jwt.sign(
      { email },
      process.env.CONFIRM_EMAIL_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const confirmLink = `http://localhost:3000/user/confirmEmail/${cofirmToken}`;
    await sendEmailService({
      to: email,
      subject: "Please confirm your email",
      message: `<a href='${confirmLink}'>click here to confirm</a>`,
    });

    res.status(200).json({ message: "Done", userInstance });
  } else {
    return res.status(400).json({ message: "passwords dont match" });
  }
};
//==================================confimation==================
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decodedToken = jwt.verify(
    token,
    process.env.CONFIRM_EMAIL_TOKEN_SECRET
  );
  const confirmationCheck = await userModel.findOne({
    email: decodedToken.email,
  });
  if (confirmationCheck.isConfirmed === true) {
    return res.status(400).json({ message: "your email is already confirmed" });
  }
  const user = await userModel.findOneAndUpdate(
    { email: decodedToken.email },
    { isConfirmed: true },
    { new: true }
  );
  res.status(200).json({ message: "email confirmed", user });
};
//===============================================================
//* 2-login-->with create token
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  user.isOnline = true;
  user.isDeleted = false;
  user = await user.save();

  const userToken = jwt.sign(
    { email, _id: user.id },
    process.env.SIGN_IN_TOKEN_SECRET
  );
  res.status(200).json({ message: "Login successful", userToken });
};

//*#####
//* 3-change password (user must be logged in)
//*#####
export const changePassword = async (req, res, next) => {
  const { _id } = req.authUser;
  const { oldPassword, newPassword, cPassword } = req.body;
  if (oldPassword === newPassword) {
    return res
      .status(400)
      .json({ message: "new password and old password are the same" });
  }
  if (newPassword !== cPassword) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  const user = await userModel.findById(_id);

  const decodedPassword = bcrypt.compareSync(oldPassword, user.password);
  if (!user) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }
  if (user.isDeleted == "true") {
    return res
      .status(400)
      .json({ message: "This account is deleted. Please login again. " });
  }
  if (user.isOnline == "false") {
    return res.status(400).json({ message: "please login first " });
  }

  if (!decodedPassword) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  const newHashedPassword = bcrypt.hashSync(newPassword, 10);
  user.password = newHashedPassword;
  await user.save();
  res.status(200).json({ message: "password updated successfully" });
};

//*######
//* 4-update user (age , firstName , lastName)(user must be logged in)
//*######
export const updateUser = async (req, res, next) => {
  const { _id } = req.authUser;
  const { age, userName, phone } = req.body;

  const isUserExist = await userModel.findByIdAndUpdate(
    _id,
    { age, userName, phone },
    { new: true }
  );
  if (isUserExist.isDeleted == "true") {
    return res
      .status(400)
      .json({ message: "This account is deleted. Please login again." });
  }
  if (isUserExist.isOnline == "false") {
    return res.status(400).json({ message: "please login first " });
  }
  if (!isUserExist) {
    res.status(400).json({ message: "Invalid login credentials" });
  }
  res.status(200).json({ message: "user updated successfully", isUserExist });
};

//*######
//*5-delete user(user must be logged in)
//*######

export const deleteUser = async (req, res, next) => {
  const { _id } = req.authUser;

  const user = await userModel.findByIdAndDelete(_id);
  res.status(200).json({ message: "user deleted successfully" });
  if (user.isOnline == "false") {
    return res.status(400).json({ message: "please login first " });
  }
  if (!user) {
    res.status(400).json({ message: "Invalid login credentials" });
  }
};

//*6-soft delete(user must be logged in)
export const softDelete = async (req, res, next) => {
  const { _id } = req.authUser;
  const user = await userModel.findById(_id);

  if (!user) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  if (user.isDeleted === "true" && user.isOnline === "false") {
    return res.status(400).json({ message: "User already deleted" });
  }

  if (user.isOnline === "false") {
    return res.status(400).json({ message: "Please log in" });
  }

  user.isDeleted = "true";
  user.isOnline = "false";
  await user.save();

  res.status(200).json({ message: "User soft deleted successfully" });
};

//*7-logout
export const logOut = async (req, res, next) => {
  const { _id } = req.authUser;

  const user = await userModel.findByIdAndUpdate(
    _id,
    { isOnline: false },
    { new: true }
  );
  if (user.isOnline == "false") {
    return res.status(400).json({ message: "User already logged out" });
  }
  if (!user) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  if (user.isDeleted == "true") {
    return res
      .status(400)
      .json({ message: "This account is deleted. Please login again." });
  }

  res.status(200).json({ message: "User logged out successfully" });
};

//** new ** logged user qr code
export const myQrCode = async (req, res, next) => {
  const { _id } = req.authUser;

  const user = await userModel.findById(_id);
  if (user.isOnline == false) {
    return res.status(400).json({ message: "User already logged out" });
  }
  if (!user) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  if (user.isDeleted == true) {
    return res
      .status(400)
      .json({ message: "This account is deleted. Please login again." });
  }
  const qrcode = await generateQrCode({
    data: [
      { id: user._id },
      { userName: user.userName },
      { email: user.email },
    ],
  });
  res.status(200).json({ message: "done", qrcode });
};

//** new ** search user by id and get his qr code
export const searchUserQrCode = async (req, res, next) => {
  const { _id } = req.params;

  const user = await userModel.findById(_id);

  if (!user) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (user.isDeleted == true) {
    return res.status(400).json({ message: "This account is deleted." });
  }
  const qrcode = await generateQrCode({
    data: [
      { id: user._id },
      { userName: user.userName },
      { email: user.email },
    ],
  });
  res.status(200).json({ message: "done", qrcode });
};

//**new ** upload one profile picture
export const uploadProfilePic = async (req, res, next) => {
  const { _id } = req.authUser;
  if (!req.file) {
    return next(new Error("please upload a profile picture", { cause: 400 }));
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Users/Profiles/${req.authUser._id}`,
      unique_filename: false,
      resource_type: "image",
    }
  );

  const user = await userModel.findByIdAndUpdate(
    _id,
    { profilePic: { public_id, secure_url } },
    { new: true }
  );

  if (!user) {
    await cloudinary.uploader.destroy(public_id);
  }
  res.status(200).json({ message: "done", user });
}

//**new ** upload one profile picture
export const uploadUserCoverPic = async (req, res, next) => {
  const { _id } = req.authUser;
  if (!req.file) {
    return next(new Error("please upload a cover picture", { cause: 400 }));
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Users/Cover/${req.authUser._id}`,
      unique_filename: false,
      resource_type: "image",
    }
  );

  const user = await userModel.findByIdAndUpdate(
    _id,
    { coverPic: { public_id, secure_url } },
    { new: true }
  );

  if (!user) {
    await cloudinary.uploader.destroy(public_id);
  }
  res.status(200).json({ message: "done", user });
};
//**new ** upload bulk profile picture
export const bulkProfilePics = async (req, res, next) => {
  const { _id } = req.authUser;
  let bulkPictures = req.files;
  if (!bulkPictures) {
    return next(new Error("no picture attached", { cause: 400 }));
  }
  let uploadPromise = bulkPictures.map(async (picture) => {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      picture.path,
      {
        folder: `Users/Profiles/${req.authUser._id}`,
        unique_filename: false,
        resource_type: "image",
      }
    );
    return { public_id, secure_url };
  });
  let uploadResponse = await Promise.all(uploadPromise);

  const user = await userModel.findByIdAndUpdate(
    _id,
    { profilePic: uploadResponse },
    { new: true }
  );

  if (!user) {
    uploadResponse.forEach(async (pic) => {
      await cloudinary.uploader.destroy(pic.public_id);
    });
  }
  res.status(200).json({ message: "done", user });
};

//** new ** delete one picture
export const deleteOnePic = async (req, res, next) => {
  const { _id } = req.authUser;
  const { public_id } = req.body;

  if (!public_id || typeof public_id !== "string") {
    return res.status(400).json({ message: "Invalid public_id" });
  }
  const result = await cloudinary.uploader.destroy(public_id);

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
    const result =await cloudinary.api.delete_resources_by_prefix(folder);
    res.status(200).json({ message: "images deleted", result });
  } catch (error) {
    console.log(error);

  }

};
