import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";      
import { ApiError } from "../utils/ApiError.js";   
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
const video = await Video.findById(videoId);

if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Video ID is required",
    });
  }

  // 2️⃣ Calculate skip for pagination
  const skip = (page - 1) * limit;

  // 3️⃣ Fetch comments for this video
  const comments = await Comment.find({ video: videoId })
    .populate("user", "username email avatar") // populate user info
    .sort({ createdAt: -1 }) // latest first
    .skip(skip)
    .limit(parseInt(limit));

  // 4️⃣ Count total comments for pagination info
  const totalComments = await Comment.countDocuments({ video: videoId });

  // 5️⃣ Return response
  res.status(200).json({
    success: true,
    totalComments,
    currentPage: Number(page),
    totalPages: Math.ceil(totalComments / limit),
    comments,
  });
})

export {getVideoComments}