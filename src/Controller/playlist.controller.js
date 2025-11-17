import mpngoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Playlist} from "../models/playlist.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name){
        return res.status(400).json({
            success:true,
            message:"Playlist name is required"

        })
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user?._id,
        videos: []
});
  console.log("✅ Playlist created:", playlist._id);
  return res.status(201).json({
        success: true,
        message: "Playlist created successfully",
        data: playlist
    });
})

export {createPlaylist}