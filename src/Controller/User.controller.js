import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId) =>{
     try {
      const user =  await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken =  user.generateRefreshToken()
      
      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false })
      
      
      return {accessToken, refreshToken}

     } catch (error) {
        throw new ApiError(500, "Failed to generate tokens" + error.message)    
     }
}

const registerUser = asyncHandler(async (req, res) => {

    //   Add these console logs at the very top
    // console.log("Body received:", req.body);
    // console.log("Files received:", req.files);
    // console.log("Avatar file:", req.files?.avatar?.[0]);
    // console.log("Cover file:", req.files?.coverImage?.[0]);

    const { username, email, password, fullName } = req.body;
    // console.log(req.body); for postman testing
    
    if ([fullName, username, email, password].some(f => !f?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) throw new ApiError(409, "Username or email already taken");

    const avatarPath = req.files?.avatar?.[0]?.path;
    const coverImagePath = req.files?.coverImage?.[0]?.path;
    //  console.log(req.files);
     
    if (!avatarPath) throw new ApiError(400, "Avatar is required");

    const avatar = await uploadOnCloudinary(avatarPath);
    const coverImage = coverImagePath ? await uploadOnCloudinary(coverImagePath) : null;

    if (!avatar) throw new ApiError(500, "Failed to upload avatar");

    const newUser = await User.create({
        fullName,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
   console.log("New user _id:", newUser._id);
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    if (!createdUser) throw new ApiError(500, "Failed to create user");

    return res.status(200).json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;
    
    if(!username || !email){
        throw new ApiError(400, "Username or email is required");
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
     })
     
     if(!user) {
        throw new ApiError(404, "User not found");
     }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const{accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    if(!accessToken || !refreshToken){
        throw new ApiError(500, "Failed to generate tokens");
    }

    const userData = await User.findById(user._id).select("-password -refreshToken")
    if(!userData) throw new ApiError(500, "Failed to retrieve user data");

    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {user: userData, accessToken, refreshToken}, "Login successful"))    
});


const logoutUser = asyncHandler(async(req, res) =>{
    User.findById
});

export { 
    registerUser,
    loginUser};
