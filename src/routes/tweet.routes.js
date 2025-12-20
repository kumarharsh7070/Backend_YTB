import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, getUserTweets,updateTweet ,deleteTweet} from "../Controller/tweet.controller.js";

const router = express.Router();

// Create a new tweet
router.post("/", verifyJWT, createTweet);

// Get tweets of the logged-in user
router.get("/user", verifyJWT, getUserTweets);

// Get tweets of a specific user by userId
router.get("/user/:userId", verifyJWT, getUserTweets);

router.patch("/:tweetId", verifyJWT, updateTweet);

router.delete("/:tweetId", verifyJWT, deleteTweet);

export default router;
