import jwt from "jsonwebtoken";
import { userModel } from "../../database/models/user.model.js";

export const auth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(400).json({ message: "please sign up " });
  }

  if (!authorization.startsWith("trelloSecret")) {
    return res.status(400).json({ message: "invaild token prefix" });
  }

  const userToken = authorization.split(" ")[1];
  if (!userToken) {
    return res.status(400).json({ message: "Invalid token" });
  }
  try {
    const decodedToken = jwt.verify(userToken, "trelloSecret");
    console.log(decodedToken)
      if (!decodedToken || !decodedToken._id) {
        return res.status(400).json({ message: "Invalid token" });
      }
      
      const isUserExist = await userModel.findById(decodedToken._id);
      if (!isUserExist) {
        return res.status(400).json({ message: "Invalid login credentials" });
      }
      req.authUser = isUserExist;
      next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
    
  }
 
};
