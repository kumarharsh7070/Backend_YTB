import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async(req,res)=>{
     const {channelId} = req.params
     const userId = req.user._id;

     if(userId.toString()=== channelId.toString()){

        return res.status(400).json({
            success:false,
            message:"You cannot subscribe to your own channel",
        })
     }

    const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    // unsubscribe: remove the existing subscription
    await Subscription.findByIdAndDelete(existingSubscription._id);

    return res.status(200).json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } else {
    // subscribe: create a new subscription document
    const newSubscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      subscription: newSubscription,
    });
  }
  });

  const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // 1️⃣ Validate input
  if (!channelId) {
    return res.status(400).json({
      success: false,
      message: "Channel ID is required",
    });
  }

  // 2️⃣ Find all subscriptions where 'channel' matches the given ID
  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username email avatar") // only include basic info of subscriber
    .sort({ createdAt: -1 });

  // 3️⃣ If no subscribers
  if (subscribers.length === 0) {
    return res.status(200).json({
      success: true,
      totalSubscribers: 0,
      subscribers: [],
      message: "No subscribers found for this channel",
    });
  }

  // 4️⃣ Return data
  res.status(200).json({
    success: true,
    totalSubscribers: subscribers.length,
    subscribers,
  });
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // 1️⃣ Validate input
  if (!subscriberId) {
    return res.status(400).json({
      success: false,
      message: "Subscriber ID is required",
    });
  }

  // 2️⃣ Find all subscriptions where this user is the subscriber
  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username email avatar") // show channel details
    .sort({ createdAt: -1 });

  // 3️⃣ If no subscriptions found
  if (subscriptions.length === 0) {
    return res.status(200).json({
      success: true,
      totalChannels: 0,
      subscribedChannels: [],
      message: "User is not subscribed to any channels",
    });
  }

  // 4️⃣ Return list of channels and count
  res.status(200).json({
    success: true,
    totalChannels: subscriptions.length,
    subscribedChannels: subscriptions.map((sub) => sub.channel),
  });
});


  export {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels};



