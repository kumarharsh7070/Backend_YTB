import express from "express";
import {
  getAllvideo,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus

} from "../Controller/video.controller.js";

import { upload } from "../middlewares/Multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 📌 GET all videos
router.get("/", getAllvideo);

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

// 📌 GET video by ID
router.get("/:videoId", getVideoById);

// 📌 PUT update video by ID
router.put(
  "/:videoId",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateVideo
);

// delete video

router.delete("/:videoId", verifyJWT, deleteVideo);

// togglepublish video

router.patch("/toggle-publish/:videoId", verifyJWT, togglePublishStatus)

export default router;
