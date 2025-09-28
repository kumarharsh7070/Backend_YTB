// src/index.js
import dotenv from "dotenv";

// ✅ Load env variables before anything else
dotenv.config({ path: "./.env" });

import connectDB from "./Db/connection.js";
import app from "./app.js";

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
