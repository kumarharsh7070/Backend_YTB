import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================= VIDEO LIKE ================= */
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const video = await Video.findById(videoId);
  if (!video) return res.status(404).json({ success: false });

  const existing = await Like.findOne({ video: videoId, likedBy: userId });

  if (existing) {
    await Like.findByIdAndDelete(existing._id);
    return res.json({ success: true, liked: false });
  }

  await Like.create({ video: videoId, likedBy: userId });

  // 🔔 CREATE LIKE NOTIFICATION
  if (video.owner.toString() !== userId.toString()) {
    await Notification.create({
      receiver: video.owner,
      sender: userId,
      type: "LIKE",
      video: video._id,
    });
  }

  res.status(201).json({ success: true, liked: true });
});

/* ================= COMMENT LIKE ================= */
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({ success: false, message: "Invalid comment id" });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({ success: true, liked: false });
  }

  await Like.create({ comment: commentId, likedBy: userId });

  // 🔔 NOTIFICATION
  if (comment.user.toString() !== userId.toString()) {
    await Notification.create({
      receiver: comment.user,
      sender: userId,
      type: "COMMENT_LIKE",
      comment: comment._id,
    });
  }

  return res.status(201).json({ success: true, liked: true });
});

/* ================= TWEET LIKE (OPTIONAL) ================= */
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(tweetId)) {
    return res.status(400).json({ success: false, message: "Invalid tweet ID" });
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    return res.status(404).json({ success: false, message: "Tweet not found" });
  }

  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({ success: true, liked: false });
  }

  await Like.create({ tweet: tweetId, likedBy: userId });

  return res.status(201).json({ success: true, liked: true });
});

/* ================= GET LIKED VIDEOS ================= */
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true, $ne: null },
  })
    .populate("video", "title description thumbnail owner")
    .sort({ createdAt: -1 });

  const formatted = likedVideos.map((like) => ({
    _id: like.video._id,
    title: like.video.title,
    description: like.video.description,
    thumbnail: like.video.thumbnail,
    owner: like.video.owner,
  }));

  res.status(200).json({
    success: true,
    totalLikedVideos: formatted.length,
    likedVideos: formatted,
  });
});
const getVideoLikeStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const totalLikes = await Like.countDocuments({ video: videoId });
  const isLiked = await Like.exists({ video: videoId, likedBy: userId });

  res.json({
    success: true,
    totalLikes,
    isLiked: Boolean(isLiked),
  });
});


export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  getVideoLikeStatus
};
