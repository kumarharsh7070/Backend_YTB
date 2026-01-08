import express from "express";
import {
  getMyNotifications,
  markNotificationsRead,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, getMyNotifications);
router.get("/unread-count", verifyJWT, getUnreadCount);
router.patch("/mark-read", verifyJWT, markNotificationsRead);

export default router;
