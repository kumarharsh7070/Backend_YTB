import express from "express";
import {
  getAllvideo,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getChannelVideos

} from "../Controller/video.controller.js";

import { upload } from "../middlewares/Multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 📌 GET all videos
router.get("/", getAllvideo);

// 📌 GET channel videos (MOVE UP ⬆️)
router.get("/channel/:channelId", getChannelVideos);

// 📌 GET video by ID
router.get("/:videoId", getVideoById);

// 📌 POST new video (publish)
router.post(
  "/publish",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

// 📌 UPDATE video
router.put(
  "/:videoId",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateVideo
);

// 📌 DELETE video
router.delete("/:videoId", verifyJWT, deleteVideo);

// 📌 TOGGLE publish status
router.patch("/toggle-publish/:videoId", verifyJWT, togglePublishStatus);

export default router;
