import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"      
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  // 1️⃣ Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    });
  }

  // 2️⃣ Check if user already liked this video
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  // 3️⃣ If already liked → unlike (remove the like)
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({
      success: true,
      message: "Unliked the video",
    });
  }

  // 4️⃣ If not liked → add new like
  const newLike = await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res.status(201).json({
    success: true,
    message: "Liked the video",
    like: newLike,
  });
});

//comment like ----------------------------------

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  // 1️⃣ Validate ObjectId early
  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({ success: false, message: "Invalid comment id" });
  }

  // 2️⃣ Ensure the comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }

  // 3️⃣ Check if already liked
  const existing = await Like.findOne({ comment: commentId, likedBy: userId });

  if (existing) {
    // Unlike
    await Like.findByIdAndDelete(existing._id);
    return res.status(200).json({ success: true, message: "Unliked the comment" });
  }

  // 4️⃣ Like
  const like = await Like.create({ comment: commentId, likedBy: userId });
  return res.status(201).json({ success: true, message: "Liked the comment", like });
});

// tweet like ----------------

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  // 1️⃣ Validate tweet ID
  if (!mongoose.isValidObjectId(tweetId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tweet ID",
    });
  }

  // 2️⃣ Check if the tweet exists
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  // 3️⃣ Check if user already liked this tweet
  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (existingLike) {
    // 4️⃣ Unlike (remove)
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({
      success: true,
      message: "Unliked the tweet",
    });
  }

  // 5️⃣ Like (create)
  const newLike = await Like.create({
    tweet: tweetId,
    likedBy: userId,
  });

  return res.status(201).json({
    success: true,
    message: "Liked the tweet",
    like: newLike,
  });
});


// getlikedvideo ------------------------------

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1️⃣ Find all likes made by the user (where video field exists)
  const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true, $ne: null } })
    .populate("video", "title description thumbnail owner") // populate video details
    .sort({ createdAt: -1 }); // newest likes first

  // 2️⃣ If no liked videos found
  if (!likedVideos.length) {
    return res.status(200).json({
      success: true,
      totalLikedVideos: 0,
      likedVideos: [],
      message: "No liked videos found",
    });
  }

  // 3️⃣ Prepare response
  const formatted = likedVideos.map((like) => ({
    _id: like.video._id,
    title: like.video.title,
    description: like.video.description,
    thumbnail: like.video.thumbnail,
    owner: like.video.owner,
  }));

  res.status(200).json({
    success: true,
    totalLikedVideos: likedVideos.length,
    likedVideos: formatted,
  });
});


export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos}