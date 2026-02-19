// exprees to create backend server 
// cors - connect backend with any frontend 
// axios - to make api calls 
// cloudinary -to upload images on cloud storage 
//multer - upload the images using multer package 



import express from 'express';
import cors from 'cors'
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'

const app =express()



app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())



app.get('/',(req,res)=>res.send('Server is live'))

app.use(requireAuth());

const PORT =process.env.PORT || 3000;

app.listen(PORT , ()=>{
    console.log('Server is running on port', PORT);
    
})
