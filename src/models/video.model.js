import mongoose,{Schema, schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoschema = new Schema({
    videoFile:{
        type:String, //cloudinary url
        required:true
    },
    thumbnail:{
        type:String, //cloudinary url
        required:true
    },
    title:{
        type:String, //cloudinary url
        required:true
    },
    description:{
        type:String, 
        required:true
    },
    duration:{
        type:number, 
        required:true
    },
    views:{
        type:number,
        default:0
    },
    ispublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

videoschema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoschemaschema)