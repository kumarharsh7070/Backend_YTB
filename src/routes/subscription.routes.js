import express from "express";
import { toggleSubscription,getUserChannelSubscribers,getSubscribedChannels } from "../Controller/subscription.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:channelId", verifyJWT, toggleSubscription);
router.get("/subscribers/:channelId", verifyJWT, getUserChannelSubscribers);
router.get("/subscribed/:subscriberId", verifyJWT, getSubscribedChannels);


export default router;