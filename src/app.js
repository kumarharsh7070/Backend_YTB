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


// router declare
app.use('/api/v1/users',UserRoutes);

export default app;