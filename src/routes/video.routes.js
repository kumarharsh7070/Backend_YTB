import express from "express";
import { getAllvideo } from "../Controller/video.controller.js";

const router = express.Router();

// This is your GET endpoint
router.get("/", getAllvideo);

export default router;