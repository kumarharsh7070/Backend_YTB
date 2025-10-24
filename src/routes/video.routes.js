import express from "express";
import { getAllvideo, publishAVideo } from "../Controller/video.controller.js";
import { upload } from "../middlewares/Multer.middleware.js"; // your multer middleware
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

// GET all videos
router.get("/", getAllvideo);

// POST new video (publish) with file upload
router.post(
  "/publish",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

export default router;
