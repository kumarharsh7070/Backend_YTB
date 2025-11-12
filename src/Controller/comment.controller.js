import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";      
import { ApiError } from "../utils/ApiError.js";   
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// 🧩 GET all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // ✅ Validate videoId
  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Video ID is required",
    });
  }

  // ✅ Optional: Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    });
  }

  // ✅ Pagination
  const skip = (page - 1) * limit;

  // ✅ Fetch comments
  const comments = await Comment.find({ video: videoId })
    .populate("user", "username email avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // ✅ Count total comments
  const totalComments = await Comment.countDocuments({ video: videoId });

  // ✅ Send response
  res.status(200).json({
    success: true,
    totalComments,
    currentPage: Number(page),
    totalPages: Math.ceil(totalComments / limit),
    comments,
  });
});


// 🧩 ADD a new comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // ✅ Validate content
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  // ✅ Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    });
  }

  // ✅ Create the comment
  const newComment = await Comment.create({
    video: videoId,
    user: userId,
    content,
  });

  // ✅ Send success response
  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    comment: newComment,
  });
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params; // 🧩 comment id from URL
  const { content } = req.body;     // 🧠 new comment text from user
  const userId = req.user._id;      // 🧍 logged-in user id (from JWT)

  // 1️⃣ Validate input
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  // 2️⃣ Find the comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // 3️⃣ Check if the comment belongs to the logged-in user
  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to edit this comment",
    });
  }

  // 4️⃣ Update comment content
  comment.content = content;
  await comment.save();

  // 5️⃣ Send response
  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    updatedComment: comment,
  });
});

// update comment-------------------------------


});
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params; // 🧩 comment id from URL
  const { content } = req.body;     // 🧠 new comment text from user
  const userId = req.user._id;      // 🧍 logged-in user id (from JWT)

  // 1️⃣ Validate input
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  // 2️⃣ Find the comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // 3️⃣ Check if the comment belongs to the logged-in user
  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to edit this comment",
    });
  }

  // 4️⃣ Update comment content
  comment.content = content;
  await comment.save();

  // 5️⃣ Send response
  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    updatedComment: comment,
  });
});

// delete video----------------

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;


    if (!commentId){
      return res.status(400).json({
        success:false,
        message:"comment ID is required"
      })
    }

const comment = await Comment.findById(commentId)

 if(!comment){
  return res.status(400).json({
    success:false,
    message:"comment not found"
  })
 }

  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this comment",
    });
  }

   await Comment.findByIdAndDelete(commentId)
    return res.status(200).json({
    success: true,
    message: "comment deleted successfully",
  });
})




// ✅ Export both functions separately
export { getVideoComments, addComment,updateComment,deleteComment};
