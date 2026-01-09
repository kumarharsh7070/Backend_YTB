import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/notification.model.js";


/* ================= GET COMMENTS ================= */
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Video ID is required",
    });
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    });
  }

  const skip = (page - 1) * limit;

  const comments = await Comment.find({ video: videoId })
    .populate("user", "username avatar") // ✅ FIXED
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json({
    success: true,
    data: comments,
    totalComments,
    currentPage: Number(page),
    totalPages: Math.ceil(totalComments / limit),
  });
});

/* ================= ADD COMMENT ================= */
/* ================= ADD COMMENT ================= */
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ success: false, message: "Comment required" });
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({ success: false, message: "Video not found" });
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    user: req.user._id,
  });

  console.log("📩 Creating comment notification");
console.log("Receiver:", video.owner.toString());
console.log("Sender:", req.user._id.toString());

  // 🔔 CREATE NOTIFICATION ONLY IF NOT SELF
  if (video.owner.toString() !== req.user._id.toString()) {
    await Notification.create({
      receiver: video.owner,
      sender: req.user._id,
      type: "COMMENT",
      video: video._id,
      comment: comment._id,
    });
  }

  const populated = await comment.populate("user", "username avatar");

  res.status(201).json({
    success: true,
    data: populated,
  });
});

/* ================= UPDATE COMMENT ================= */
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  comment.content = content;
  await comment.save();

  return res.status(200).json({
    success: true,
    data: comment,
    message: "Comment updated successfully",
  });
});

/* ================= DELETE COMMENT ================= */
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});



export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};
