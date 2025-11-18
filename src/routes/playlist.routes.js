import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist } from "../Controller/playlist.controller.js"

const router = express.Router()

router.post("/", verifyJWT, createPlaylist); 
router.get("/user/:userId", getUserPlaylists)
router.get("/:playlistId", getPlaylistById);
router.patch("/:playlistId/video/:videoId", verifyJWT, addVideoToPlaylist);

export default router;