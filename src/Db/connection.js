// src/db/connection.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
    process.exit(1); // stop app if DB fails
  }
};

export default connectDB;
