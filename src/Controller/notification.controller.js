import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================= GET MY NOTIFICATIONS ================= */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ receiver: userId })
    .populate("sender", "username avatar")
    .populate("video", "title")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

/* ================= MARK ALL AS READ ================= */
export const markNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    { receiver: userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
  });
});

/* ================= UNREAD COUNT ================= */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    receiver: userId,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    count,
  });
});
