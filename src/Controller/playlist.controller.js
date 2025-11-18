import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Playlist name is required"
        });
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user._id,   // make sure route is protected
        videos: []
    });

    return res.status(201).json({
        success: true,
        message: "Playlist created successfully",
        data: playlist
    });
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    const playlists = await Playlist.find({ owner: userId })
        .populate("videos")
        .exec();

    return res.status(200).json({
        success: true,
        message: "User playlists fetched successfully",
        data: playlists
    });
});

//get by id---------


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // 1. validate playlist id
    if (!playlistId || !isValidObjectId(playlistId)) {
        return res.status(400).json({
            success: false,
            message: "Valid playlist ID is required"
        });
    }

    // 2. fetch playlist
    const playlist = await Playlist.findById(playlistId)
        .populate("videos")  // optional
        .populate("owner", "username email") // optional
        .exec();

    // 3. if playlist not found
    if (!playlist) {
        return res.status(404).json({
            success: false,
            message: "Playlist not found"
        });
    }

    // 4. return playlist
    return res.status(200).json({
        success: true,
        message: "Playlist fetched successfully",
        data: playlist
    });
});

//add video to playlist


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // 1. validate IDs
    if (!playlistId || !isValidObjectId(playlistId)) {
        return res.status(400).json({
            success: false,
            message: "Valid playlistId is required"
        });
    }

    if (!videoId || !isValidObjectId(videoId)) {
        return res.status(400).json({
            success: false,
            message: "Valid videoId is required"
        });
    }

    // 2. find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        return res.status(404).json({
            success: false,
            message: "Playlist not found"
        });
    }

    // 3. check if video already exists
    if (playlist.videos.includes(videoId)) {
        return res.status(400).json({
            success: false,
            message: "Video already in playlist"
        });
    }

    // 4. add video
    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json({
        success: true,
        message: "Video added to playlist successfully",
        data: playlist
    });
});



export { createPlaylist, getUserPlaylists,getPlaylistById,addVideoToPlaylist };
