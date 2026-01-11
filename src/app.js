import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ CORS configuration
const allowedOrigins = [process.env.CORS_ORIGIN];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server calls

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Cookie parser
app.use(cookieParser());

// Routes
import UserRoutes from "./routes/User.routes.js";
import VideoRoutes from "./routes/video.routes.js";
import ToggleRoutes from "./routes/subscription.routes.js";
import Liketoggle from "./routes/like.routes.js";
import Comment from "./routes/comment.routes.js";
import Playlist from "./routes/playlist.routes.js";
import Tweetroutes from "./routes/tweet.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// API routes
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/videos", VideoRoutes);
app.use("/api/v1/subscriptions", ToggleRoutes);
app.use("/api/v1/likes", Liketoggle);
app.use("/api/v1/comments", Comment);
app.use("/api/v1/playlists", Playlist);
app.use("/api/v1/tweet", Tweetroutes);
app.use("/api/v1/notifications", notificationRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
