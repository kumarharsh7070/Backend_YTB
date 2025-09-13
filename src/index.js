// src/index.js
import dotenv from "dotenv";
import express from "express";
import connectDB from "./Db/connection.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});