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
  // console.log("➡️ publishAVideo called"); for only testing purpose
  const { title, description, duration } = req.body;
  const { videoFile, thumbnail } = req.files; 
  const userId = req.user._id; 

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

  const uploadedVideo = await uploadOnCloudinary(videoFile[0].path, "videos");
  const uploadedThumbnail = await uploadOnCloudinary(thumbnail[0].path, "thumbnails");

  // Delete local temp files
  if (fs.existsSync(videoFile[0].path)) {
    fs.unlinkSync(videoFile[0].path);
  } else {
    console.warn( videoFile[0].path);
  }

  if (fs.existsSync(thumbnail[0].path)) {
    fs.unlinkSync(thumbnail[0].path);
  } else {
    console.warn( thumbnail[0].path);
  }

  const newVideo = await Video.create({
    title,
    description,
    duration,
    owner: userId,
    videoFile: uploadedVideo.secure_url,
    thumbnail: uploadedThumbnail.secure_url,
    isPublished: true,
  });

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

export { getAllvideo, publishAVideo, getVideoById };
