// src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// ✅ Load env variables at the very top
dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Debug to verify keys
console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ set" : "❌ missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ set" : "❌ missing"
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const result = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return result;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};
