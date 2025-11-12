import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getVideoComments,addComment,updateComment,deleteComment} from "../Controller/comment.controller.js"

const router = express.Router()

router.get("/:videoId", verifyJWT, getVideoComments);
router.post("/:videoId", verifyJWT, addComment);
router.patch("/:commentId", verifyJWT, updateComment);
router.delete("/:commentId", verifyJWT, deleteComment);


export default router;