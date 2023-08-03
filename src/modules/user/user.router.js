import { Router } from "express";
import * as uc from "./user.controller.js";
import { errorHandling } from "../../../utils/errorhandling.js";
import { auth } from "../../middlewares/auth.js";
import { coreValidationFunction } from "../../middlewares/validation.js";
import { userSchema } from "./user.validationSchema.js";
import {
  allowedExtensions,
  multerFunction,
} from "../../sevices/multerCloud.js";

const router = Router();

//* 1-signUp
router.post(
  "/signUp",
  coreValidationFunction(userSchema),
  errorHandling(uc.signUp)
);

router.get("/confirmEmail/:token", errorHandling(uc.confirmEmail));
//* 2-login-->with create token
router.post("/logIn", errorHandling(uc.login));

//* 3-change password (user must be logged in)
router.patch("/changePassword", auth, errorHandling(uc.changePassword));

//* 4-update user (age , firstName , lastName)(user must be logged in)
router.put("/update", auth, errorHandling(uc.updateUser));

//*5-delete user(user must be logged in)
router.delete("/delete", auth, errorHandling(uc.deleteUser));

//*6-soft delete(user must be logged in)
router.patch("/softDelete", auth, errorHandling(uc.softDelete));

//*7-logout
router.patch("/logout", auth, errorHandling(uc.logOut));

//** new ** logged user qr code
router.get("/myQrCode", auth, errorHandling(uc.myQrCode));

//** new ** search user by id and get his qr code
router.get("/searchUserQrCode/:_id", auth, errorHandling(uc.searchUserQrCode));

//**new upload one profile picture
router.post(
  "/uploadProfilePic",
  auth,
  multerFunction(allowedExtensions.Image).single("picture"),
  errorHandling(uc.uploadProfilePic)
);

//**new upload one cover picture
router.post(
  "/uploadUserCoverPic",
  auth,
  multerFunction(allowedExtensions.Image).single("picture"),
  errorHandling(uc.uploadUserCoverPic)
);

//**new upload bulk profile pictures
router.post(
  "/uploadBulkProfilepics",
  auth,
  multerFunction(allowedExtensions.Image).array("picture"),
  errorHandling(uc.bulkProfilePics)
);

//** new ** delete one picture
router.delete("/deleteOnePic", auth, errorHandling(uc.deleteOnePic));

//** new ** delete many pictures
router.delete("/deleteBulk", auth, errorHandling(uc.deleteManyPics));

//** new **delete folder
router.delete("/deleteFolder", auth, errorHandling(uc.deleteFolder));



//** new **delete all images in  a folder
router.delete("/deleteAllImages", auth, errorHandling(uc.deleteAllImages));

export default router;
