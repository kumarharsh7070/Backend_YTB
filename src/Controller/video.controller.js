import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";


const getAllvideo = asyncHandler(async(req,res)=>{
    
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;


//  Convert them to numbers to avoid issues
  const pageNum = Number(page);
  const limitNum = Number(limit);
  
// Build the aggregation pipeline

const VideoAggregate =  Video.aggregate([
  {
    $match:{
      isPublished: true
    }
  },
  {
    $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
            }
    },
    {
      $unwind:"$ownerDetails",
    },
    {
      $sort:{
        createdAt: -1
      },
    },
    {
      $project:{
        _id:1,
        title:1,
        description:1,
        thumbnail:1,
        videoFile:1,
        views:1,
        duration:1,
        createdAt:1,
        "ownerDetails.name":1,
        "ownerDetails.email":1
      },
    }
  
]);

//  Apply aggregate pagination

const options = {
    page: pageNum,
    limit: limitNum,
  };

  const result = await Video.aggregatePaginate(VideoAggregate, options)

return res
   .status(200)
   .json(new ApiResponse(200, result, "All video fetched successfully"));
});

export {
   getAllvideo
}