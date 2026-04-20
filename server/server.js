// exprees to create backend server 
// cors - connect backend with any frontend 
// axios - to make api calls 
// cloudinary -to upload images on cloud storage 
//multer - upload the images using multer package 


import dotenv from "dotenv";
import express from 'express';
import cors from 'cors'
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import fs from 'fs';

const app =express()

// Create uploads directory if it doesn't exist
// if (!fs.existsSync('uploads')) {
//     fs.mkdirSync('uploads', { recursive: true });
// }

await connectCloudinary();


app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())



app.get('/',(req,res)=>res.send('Server is live'))

app.use('/api/ai', requireAuth());
app.use('/api/ai', aiRouter)
app.use('/api/ai', userRouter)

const PORT =process.env.PORT || 3000;

app.listen(PORT , ()=>{
    console.log('Server is running on port', PORT);
    
})
