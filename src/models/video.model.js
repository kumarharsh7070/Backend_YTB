import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // Cloudinary video URL
      required: true,
    },
    videoPublicId: {
      type: String, // Cloudinary video public_id (for deletion/update)
    },
    thumbnail: {
      type: String, // Cloudinary image URL
      required: true,
    },
    thumbnailPublicId: {
      type: String, // Cloudinary thumbnail public_id (for deletion/update)
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
