 import mongooose ,{Schema, schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { use } from "react";

 const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudinary url
        required:true
    },
    coverimage:{
        tyoe:String, //cloudinary url
    },
    watchistory:[
        {
            types:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[
            true,"Password is required"
        ]
    },
    refreshtokens:{
        type:String
    },
    
 },{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  await  bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
  return  jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname,
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
)
}
userSchema.methods.generateRefreshToken = function(){
    return  jwt.sign({
          _id:this._id,
}),process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
  }
 export const user = mongoose.model("User",userSchema)