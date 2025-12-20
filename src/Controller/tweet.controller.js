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
        .populate("owner");

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

// update tweet----

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    // 1️⃣ Validate Tweet ID
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    // 2️⃣ Validate content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    // 3️⃣ Find tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // 4️⃣ Authorization (only owner can update)
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet");
    }

    // 5️⃣ Update tweet
    tweet.content = content.trim();
    await tweet.save();

    // 6️⃣ Response
    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});

// delete tweet---

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // 1️⃣ Validate Tweet ID
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    // 2️⃣ Find tweet
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // 3️⃣ Authorization check (only owner can delete)
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet");
    }

    // 4️⃣ Delete tweet
    await Tweet.findByIdAndDelete(tweetId);

    // 5️⃣ Send response
    return res.status(200).json(
        new ApiResponse(200, null, "Tweet deleted successfully")
    );
});


export { createTweet, getUserTweets,updateTweet,deleteTweet };
