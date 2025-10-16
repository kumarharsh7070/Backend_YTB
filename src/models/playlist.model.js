import mongoose,{Schema, Types} from "mongoose";

const PlaylistSchema = new Schema({
     name:{
        type:String,
        required:true
     },
     description:{
        type:String,
        required:true
     },
     videos:[
        {
            type:Types.ObjectId,
            ref:"Video"
     },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
     }
},{timestamps:true})

export const Playlist = mongoose.model("Playlist",PlaylistSchema)
