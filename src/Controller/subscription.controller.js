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

  export {toggleSubscription};



