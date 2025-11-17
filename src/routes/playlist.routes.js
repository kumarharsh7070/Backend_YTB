import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createPlaylist } from "../Controller/playlist.controller.js"

const router = express.Router()

router.post("/", verifyJWT, createPlaylist); 

export default router;