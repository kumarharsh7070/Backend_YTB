import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getVideoComments} from "../Controller/comment.controller.js"

const router = express.Router()

router.get("/:videoId", verifyJWT, getVideoComments);

export default router;