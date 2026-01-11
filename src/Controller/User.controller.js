import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";



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
    if(!username && !email){
         throw new ApiError(400, "Username or email is required");

        }
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

     console.log("User logged in:", user.email);

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

//  Controller to get all users
const getAllUsers = asyncHandler(async (req, res) => {
  // 1️⃣ Find all users in the database
  const users = await User.find().select("-password -refreshToken")

  // 2️⃣ If there are no users, throw an error
  if (!users.length) {
    throw new ApiError(404, "No users found")
  }

  // 3️⃣ Send success response
  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"))
})


const logoutUser = asyncHandler(async(req, res) =>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    
    const options = {
        httpOnly: true,
        secure:true
    }
    return res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).json(new ApiResponse(200, null, "User Logout successful"))

})

//delete user 

const deleteUser = asyncHandler(async (req,res) =>{
     const {userId}  = req.params

     const user = await User.findByIdAndDelete(userId)

     if(!user){
        throw new ApiError(404,'User not found')
     }

     return res.status(200).json(new ApiResponse(200,{},'User delete successfully'))


})




const refreshAccessToken =asyncHandler(async(req,res)=>{

   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
    throw new ApiError (401,"unauthroize request")
   }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401, "Invalid refresh token")
    }
  
     const options = {
      httpOnly:true,
      secure:true
     }
  
    const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
  
      return res.status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newrefreshToken, options)
      .json(
          new ApiResponse(200,
              {accessToken,refreshToken: newrefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
    throw new ApiError (400, "Invalid old password")
   }

   user.password = newPassword
  await user.save({validateBeforeSave: false})
  
  return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))


})

const getCurrentUser = asyncHandler(async(req ,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetch successfully")
)})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  // ✅ allow partial updates
  if (!username && !email) {
    throw new ApiError(400, "At least one field is required");
  }

  const updateFields = {};

  if (username) updateFields.username = username;
  if (email) updateFields.email = email;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Account updated successfully")
  );
});


const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")

    }

   const avatar= await uploadOnCloudinary(avatarLocalPath)
   
   if(!avatar.url){
       throw new ApiError(400, "Error while uploading on avatar")
   }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            
            avatar:avatar.url
          }
},
    {new:true}
   ).select("-password")

     return res
   .status(200)
   .json(
     new ApiResponse(200, user, "Avatar Image updated successfully")
   )
})


const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image is missing")

    }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
   if(!coverImage.url){
       throw new ApiError(400, "Error while uploading the image")
   }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            
           coverImage:coverImage.url
          }
},
    {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(
     new ApiResponse(200, user, "Cover Image updated successfully")
   )
})

const getUserChannelProfile =asyncHandler(async (req,res)=>{
     
      const {username} = req.params
      
      if(!username?.trim()){
        throw new ApiError(400, "username is missing")
      }
      
   const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscriber"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscriberTo"
            }
        },
        {
            $addFields: {
      subscribersCount: {
        $size: { $ifNull: ["$subscriber", []] } // ✅ fix 1
      },
      channelsSubscribedToCount: {
        $size: { $ifNull: ["$subscriberTo", []] } // ✅ fix 2
      },
      isSubscribed: {
        $cond: {
          if: { $in: [req.user?._id, "$subscriber.subscriber"] }, // ✅ fix 3 (use correct name)
          then: true,
          else: false
        }
    }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
      ])
    if(!channel?.length){
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res)=>{
     const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            },
           
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
     ])

     return res
     .status(200)
     .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
     )
})

// forget password-------------------------------------------

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 1️⃣ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ Hash token before saving to DB
    user.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // 3️⃣ Token expiry (10 minutes)
    user.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // 4️⃣ Create reset link (frontend)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 5️⃣ Send email
    await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password.</p>
            <p>Click the link below to set a new password:</p>
            <a href="${resetLink}" target="_blank">${resetLink}</a>
            <p>This link will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password reset link sent to your email"
        )
    );
});

// reset password-----------------------------------

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful")
    );
});

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage ,
    getUserChannelProfile,
    getWatchHistory,
    getAllUsers,
    deleteUser,
    forgotPassword,
    resetPassword
};
