import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { toggleVideoLike,toggleCommentLike,toggleTweetLike , getLikedVideos,getVideoLikeStatus} from "../Controller/like.controller.js"

const router = express.Router()

router.post("/:videoId",verifyJWT , toggleVideoLike)
router.post("/comment/:commentId", verifyJWT, toggleCommentLike);
router.post("/tweet/:tweetId", verifyJWT, toggleTweetLike);
router.get("/videos", verifyJWT, getLikedVideos);
router.get(
  "/video-status/:videoId",
  verifyJWT,
  getVideoLikeStatus
);
export default router;