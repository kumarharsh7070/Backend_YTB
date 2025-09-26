import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
 const {fullName, email, username, password}= req.body
 
 if(!fullName || !email || !username || !password){
    throw new ApiError("All fields are required",400)
 }
  const emailRegex = /\S+@\S+\.\S+/; //validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const extistedUser = User.findOne({
    $or:[{ username }, { email }]
  })
  if(extistedUser){
    throw new ApiError("User already exists",409)
  }

 const avatarLocalPath= req.files?.avatar[0]?.path
 console.log(avatarLocalPath);
 const coverLocalPath=req.files?.coverimage[0]?.path
 console.log(coverLocalPath);
 });

export { registerUser };
