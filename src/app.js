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
// router declare
app.use('/api/v1/users',UserRoutes);
app.use('/api/v1/videos', VideoRoutes); 
app.use('/api/v1/toggle',ToggleRoutes);
app.use("/api/v1/likes", Liketoggle)

export default app;