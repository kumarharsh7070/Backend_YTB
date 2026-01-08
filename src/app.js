import express from 'express';
import cors from 'cors';    
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const app = express();  

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}));

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({ extended: true, limit:'16kb' }));
app.use(express.static('public'));
app.use(cookieParser())

// routes import
import UserRoutes from './routes/User.routes.js';
import VideoRoutes from "./routes/video.routes.js"
import ToggleRoutes from "./routes/subscription.routes.js"
import Liketoggle from "./routes/like.routes.js"
import Comment from "./routes/comment.routes.js"
import  Playlist  from "./routes/playlist.routes.js"
import  Tweetroutes  from './routes/tweet.routes.js'
import notificationRoutes from "./routes/notification.routes.js";

// router declare
app.use('/api/v1/users',UserRoutes);
app.use('/api/v1/videos', VideoRoutes); 
app.use('/api/v1/subscriptions',ToggleRoutes);
app.use("/api/v1/likes", Liketoggle)
app.use("/api/v1/comments",Comment)
app.use("/api/v1/playlists", Playlist);
app.use("/api/v1/tweet",Tweetroutes)
app.use("/api/v1/notifications", notificationRoutes);


// to test only for fronted api

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀",
  });
});
export default app;