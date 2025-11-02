import mongoose, { isValidObjectId } from "mongoose";
import fs from "fs";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// GET all videos with pagination, aggregation, and optional query
const getAllvideo = asyncHandler(async (req, res) => {
  console.log("➡️ getAllvideo called");
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const VideoAggregate = Video.aggregate([
    {
      $match: {
        isPublished: true,
        ...(userId && isValidObjectId(userId) ? { owner: mongoose.Types.ObjectId(userId) } : {}),
        ...(query ? { title: { $regex: query, $options: "i" } } : {}),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    { $unwind: "$ownerDetails" },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        "ownerDetails.name": 1,
        "ownerDetails.email": 1,
      },
    },
  ]);

  const options = { page: pageNum, limit: limitNum };
  const result = await Video.aggregatePaginate(VideoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All videos fetched successfully"));
});

// PUBLISH a new video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;
  const { videoFile, thumbnail } = req.files;
  const userId = req.user._id;

  // 1️⃣ Validate inputs
  if (!title || !description || !duration || !videoFile || !thumbnail) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
  }

  if (!isValidObjectId(userId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid user ID"));
  }

  // 2️⃣ Upload to Cloudinary (returns secure_url + public_id)
  const uploadedVideo = await uploadOnCloudinary(videoFile[0].path, "videos");
  const uploadedThumbnail = await uploadOnCloudinary(thumbnail[0].path, "thumbnails");

  // 3️⃣ Clean up local temp files (multer uploads)
  try {
    if (fs.existsSync(videoFile[0].path)) fs.unlinkSync(videoFile[0].path);
    if (fs.existsSync(thumbnail[0].path)) fs.unlinkSync(thumbnail[0].path);
  } catch (err) {
    console.warn("⚠️ Error cleaning temp files:", err);
  }

  // 4️⃣ Save to MongoDB with both URLs + public IDs
  const newVideo = await Video.create({
    title,
    description,
    duration,
    owner: userId,
    videoFile: uploadedVideo.secure_url,
    videoPublicId: uploadedVideo.public_id,       // ✅ added
    thumbnail: uploadedThumbnail.secure_url,
    thumbnailPublicId: uploadedThumbnail.public_id, // ✅ added
    isPublished: true,
  });

  // 5️⃣ Return success response
  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

//get video by id

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid video ID"));
  }

  const video = await Video.findById(videoId)
    .populate("owner", "name email")
    .lean();

  if (!video) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Video not found"));
  }

  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched by id successfully"));
});

// UpdateVideo

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user && req. user._id;

  // 1️⃣ Validate videoId
  if (!isValidObjectId(videoId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid video ID"));
  }

  // 2️⃣ Find video
  const video = await Video.findById(videoId);
  if (!video) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Video not found"));
  }

  // 3️⃣ Check if logged-in user is the owner
  if (video.owner.toString() !== userId.toString()) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "You are not authorized to update this video"));
  }

  // 4️⃣ Extract updatable fields from request body
  const { title, description, duration, isPublished } = req.body;
  const updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (duration) updates.duration = duration;
  if (typeof isPublished !== "undefined") updates.isPublished = isPublished;

  // 5️⃣ Handle file uploads (if provided)
  try {
    if (req.files) {
      // --- Handle new thumbnail ---
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        const file = req.files.thumbnail[0];
        const uploadedThumb = await uploadOnCloudinary(file.path, "thumbnails");

        // Remove local temp file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        // Delete old Cloudinary thumbnail (if exists)
        if (video.thumbnailPublicId) {
          await cloudinary.v2.uploader.destroy(video.thumbnailPublicId, {
            resource_type: "image",
          });
        }

        // Save new thumbnail info
        updates.thumbnail = uploadedThumb.secure_url;
        updates.thumbnailPublicId = uploadedThumb.public_id;
      }

      // --- Handle new video file ---
      if (req.files.videoFile && req.files.videoFile.length > 0) {
        const file = req.files.videoFile[0];
        const uploadedVideo = await uploadOnCloudinary(file.path, "videos");

        // Remove local temp file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        // Delete old Cloudinary video (if exists)
        if (video.videoPublicId) {
          await cloudinary.v2.uploader.destroy(video.videoPublicId, {
            resource_type: "video",
          });
        }

        // Save new video info
        updates.videoFile = uploadedVideo.secure_url;
        updates.videoPublicId = uploadedVideo.public_id;
      }
    }
  } catch (err) {
    console.error("File upload or cleanup error:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Error uploading or replacing media"));
  }

  // 6️⃣ Update video in DB
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updates },
    { new: true }
  ).populate("owner", "name email");

  // 7️⃣ Respond with updated data
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

//  delete video

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // 1️⃣ Check if videoId is provided
  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Video ID is required",
    });
  }

  // 2️⃣ Find the video by ID
  const video = await Video.findById(videoId);

  // 3️⃣ If video not found, return error
  if (!video) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    });
  }

  // 4️⃣ Check if the logged-in user is the owner of this video
  if (video.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this video",
    });
  }

  // 5️⃣ Delete the video from database
  await Video.findByIdAndDelete(videoId);

  // 6️⃣ Send success response
  return res.status(200).json({
    success: true,
    message: "Video deleted successfully",
  });
});

export { getAllvideo, publishAVideo, getVideoById, updateVideo, deleteVideo };
