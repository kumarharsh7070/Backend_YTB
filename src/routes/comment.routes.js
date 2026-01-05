// routes/comment.routes.js
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment
} from "../Controller/comment.controller.js";

const router = express.Router();

/* GET all comments of a video */
router.get("/:videoId", getVideoComments);

/* ADD new comment to a video */
router.post("/:videoId", verifyJWT, addComment);

/* UPDATE comment */
router.patch("/:commentId", verifyJWT, updateComment);

/* DELETE comment */
router.delete("/:commentId", verifyJWT, deleteComment);

export default router;
