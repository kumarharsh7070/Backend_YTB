import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async(loalFilePath) =>{
  try {
      if(!loalFilePath) return null
      // upload the file on cloudinary
   const response= await cloudinary.uploader.upload(loalFilePath,{resource_type:"auto"})
    // file has been uploaded successfull
    console.log("file has been uploaded successfully on cloudinary",response.url);
    return response
    } catch (error) {
      fs.unlinkSync(loalFilePath)
      console.log("error while uploading on cloudinary",error);  //remove the file from local storage
      return null
  }
}


export {uploadOnCloudinary}
