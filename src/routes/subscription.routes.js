import express from "express";
import { toggleSubscription } from "../Controller/subscription.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:channelId", verifyJWT, toggleSubscription);

export default router;