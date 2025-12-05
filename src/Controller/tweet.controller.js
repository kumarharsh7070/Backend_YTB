import mongoose from "mongoose";                    
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";   
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// CREATE TWEET
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user?._id
    });

    if (!tweet) {
        throw new ApiError(500, "Failed to create Tweet");
    }

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
});

// GET USER TWEETS
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const ownerId = userId || req.user?._id;

    if (!ownerId) {
        throw new ApiError(400, "User id is required");
    }

    const tweets = await Tweet.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .populate("owner"); // keep it simple (safe)

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

export { createTweet, getUserTweets };
