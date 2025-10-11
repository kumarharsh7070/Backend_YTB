import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
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

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email}= req.body
    

    if(!fullName || !email){
        throw new ApiError(400, "All filed are require")
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName: fullName,
               email: email.toLowerCase()
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})

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
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
               channelsSubscribedToCount:{
                   $size:"$subscriberTo"
               } ,
               isSubscribed:{
                $cond:{
                    if:{
                        $in:[req.user?._id, "$subscribers.subscriber"]},
                        then:true,
                        else:false
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
                from:"video",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"user",
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
    getWatchHistory
};
