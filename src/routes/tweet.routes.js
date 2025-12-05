import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createTweet } from "../Controller/tweet.controller.js";

const router = express.Router()


router.post("/", verifyJWT, createTweet);



export default router;