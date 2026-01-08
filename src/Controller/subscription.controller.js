import { Subscription } from "../models/subscription.model.js";
import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================= TOGGLE SUBSCRIPTION ================= */
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (userId.toString() === channelId.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot subscribe to your own channel",
    });
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);

    return res.status(200).json({
      success: true,
      subscribed: false,
      message: "Unsubscribed successfully",
    });
  }

  await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  // 🔔 NOTIFICATION
  await Notification.create({
    receiver: channelId,
    sender: userId,
    type: "SUBSCRIBE",
  });

  return res.status(201).json({
    success: true,
    subscribed: true,
    message: "Subscribed successfully",
  });
});

/* ================= GET CHANNEL SUBSCRIBERS ================= */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    totalSubscribers: subscribers.length,
    subscribers,
  });
});

/* ================= GET SUBSCRIBED CHANNELS ================= */
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    totalChannels: subscriptions.length,
    subscribedChannels: subscriptions.map((sub) => sub.channel),
  });
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
