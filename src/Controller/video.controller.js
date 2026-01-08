import mongoose, { isValidObjectId } from "mongoose";
import fs from "fs";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";




// GET all videos with pagination, aggregation, and optional query
const getAllvideo = asyncHandler(async (req, res) => {
  console.log("➡️ getAllvideo called");

  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const searchQuery = query.trim();

  const matchStage = {
    isPublished: true,
  };

  // ✅ Filter by channel (owner)
  if (userId && isValidObjectId(userId)) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // ✅ Search by title
  if (searchQuery) {
    matchStage.title = { $regex: searchQuery, $options: "i" };
  }

  const VideoAggregate = Video.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
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
        ownerDetails: 1,
      },
    },
  ]);

  const options = {
    page: pageNum,
    limit: limitNum,
  };

  const result = await Video.aggregatePaginate(VideoAggregate, options);

  return res.status(200).json(
    new ApiResponse(200, result, "All videos fetched successfully")
  );
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
    .populate("owner", "username avatar email") // ✅ FIX HERE
    .lean();

  if (!video) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Video not found"));
  }

  // 🔥 Increment views
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  return res.status(200).json(
    new ApiResponse(200, video, "Video fetched by id successfully")
  );
});

// UpdateVideo

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  // 🔐 Auth guard
  if (!userId) {
    return res.status(401).json(
      new ApiResponse(401, null, "Unauthorized request")
    );
  }

  // 1️⃣ Validate videoId
  if (!isValidObjectId(videoId)) {
    return res.status(400).json(
      new ApiResponse(400, null, "Invalid video ID")
    );
  }

  // 2️⃣ Find video
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json(
      new ApiResponse(404, null, "Video not found")
    );
  }

  // 3️⃣ Ownership check
  if (video.owner.toString() !== userId.toString()) {
    return res.status(403).json(
      new ApiResponse(403, null, "You are not authorized to update this video")
    );
  }

  // 4️⃣ Allowed updates
  const { title, description, isPublished } = req.body;
  const updates = {};

  if (title) updates.title = title;
  if (description) updates.description = description;
  if (typeof isPublished === "boolean") {
    updates.isPublished = isPublished;
  }

  // 5️⃣ Handle media updates
  try {
  if (req.files && Object.keys(req.files).length > 0) {

    // 🖼 Thumbnail
    if (req.files.thumbnail?.length) {
      const file = req.files.thumbnail[0];
      const uploadedThumb = await uploadOnCloudinary(file.path, "thumbnails");

      // delete old thumbnail
      if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId, "image");
      }

      updates.thumbnail = uploadedThumb.secure_url;
      updates.thumbnailPublicId = uploadedThumb.public_id;
    }

    // 🎥 Video file
    if (req.files.videoFile?.length) {
      const file = req.files.videoFile[0];
      const uploadedVideo = await uploadOnCloudinary(file.path, "videos");

      // delete old video
      if (video.videoPublicId) {
        await deleteFromCloudinary(video.videoPublicId, "video");
      }

      updates.videoFile = uploadedVideo.secure_url;
      updates.videoPublicId = uploadedVideo.public_id;
    }
  }
} catch (error) {
  console.error("Media replace error:", error);
  return res.status(500).json(
    new ApiResponse(500, null, "Error uploading or replacing media")
  );
}

  // 🚫 No update data
  if (Object.keys(updates).length === 0) {
    return res.status(400).json(
      new ApiResponse(400, null, "No valid fields provided for update")
    );
  }

  // 6️⃣ Save updates
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updates },
    { new: true }
  ).populate("owner", "username email avatar");

  // 7️⃣ Response
  return res.status(200).json(
    new ApiResponse(200, updatedVideo, "Video updated successfully")
  );
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


// toggle video


const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  // 1️⃣ Validate ID
  if (!isValidObjectId(videoId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid video ID",
    })
  }

  // 2️⃣ Find the video
  const video = await Video.findById(videoId)
  if (!video) {
    return res.status(404).json({
      success: false,
      message: "Video not found",
    })
  }

  // 3️⃣ Check owner (authorization)
  if (video.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to change this video's status",
    })
  }

  // 4️⃣ Toggle publish status
  video.isPublished = !video.isPublished
  await video.save()

  // 5️⃣ Send response
  res.status(200).json({
    success: true,
    message: `Video ${video.isPublished ? "published" : "unpublished"} successfully`,
    video,
  })
})

// get channel

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .populate("owner", "username avatar");

  return res.status(200).json(
    new ApiResponse(200, videos, "Channel videos fetched successfully")
  );
});

export { getAllvideo, publishAVideo, getVideoById, updateVideo, deleteVideo,togglePublishStatus,getChannelVideos };
