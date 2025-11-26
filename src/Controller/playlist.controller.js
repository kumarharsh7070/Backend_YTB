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
      message: "Playlist name is required",
    });
  }

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user._id, // ensure route is protected
    videos: [],
  });

  return res.status(201).json({
    success: true,
    message: "Playlist created successfully",
    data: playlist,
  });
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const playlists = await Playlist.find({ owner: userId }).populate("videos").exec();

  return res.status(200).json({
    success: true,
    message: "User playlists fetched successfully",
    data: playlists,
  });
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Valid playlist ID is required",
    });
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "username email")
    .exec();

  if (!playlist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Playlist fetched successfully",
    data: playlist,
  });
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Valid playlistId is required",
    });
  }

  if (!videoId || !isValidObjectId(videoId)) {
    return res.status(400).json({
      success: false,
      message: "Valid videoId is required",
    });
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  // safer check when videos are ObjectIds
  if (playlist.videos.some((v) => v.toString() === videoId)) {
    return res.status(400).json({
      success: false,
      message: "Video already in playlist",
    });
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res.status(200).json({
    success: true,
    message: "Video added to playlist successfully",
    data: playlist,
  });
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Valid playlistId is required",
    });
  }

  if (!videoId || !isValidObjectId(videoId)) {
    return res.status(400).json({
      success: false,
      message: "Valid videoId is required",
    });
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  const index = playlist.videos.findIndex((v) => v.toString() === videoId);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Video not found in playlist",
    });
  }

  playlist.videos.splice(index, 1);
  await playlist.save();

  return res.status(200).json({
    success: true,
    message: "Video removed from playlist successfully",
    data: playlist,
  });
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Valid playlistId is required",
    });
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  // Optional: ensure only owner can delete
  if (req.user && playlist.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this playlist",
    });
  }

  await playlist.remove();

  return res.status(200).json({
    success: true,
    message: "Playlist deleted successfully",
    data: null,
  });
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !isValidObjectId(playlistId)) {
    return res.status(400).json({
      success: false,
      message: "Valid playlistId is required",
    });
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.status(404).json({
      success: false,
      message: "Playlist not found",
    });
  }

  if (req.user && playlist.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this playlist",
    });
  }

  if (name) playlist.name = name;
  if (description !== undefined) playlist.description = description;

  await playlist.save();

  const populated = await Playlist.findById(playlistId).populate("videos").populate("owner", "username email");

  return res.status(200).json({
    success: true,
    message: "Playlist updated successfully",
    data: populated,
  });
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
