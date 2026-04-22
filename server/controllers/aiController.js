import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import connectCloudinary from "../configs/cloudinary.js";
import {v2 as cloudinary } from 'cloudinary';
import axios from "axios";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { extractText } from "unpdf";






const AI = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const getArticleTokenBudget = (requestedLength) => {
    const safeLength = Number.isFinite(Number(requestedLength)) ? Number(requestedLength) : 800;

    // Rough conversion: 1 token ~= 0.75 words. Add headroom and clamp.
    const estimatedTokens = Math.ceil((safeLength / 0.75) * 1.2);
    return Math.min(Math.max(estimatedTokens, 900), 3500);
};

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;
        const requestedLength = Number(length) || 800;
        const maxTokens = getArticleTokenBudget(requestedLength);

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        const response = await AI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `Write complete, well-structured articles in markdown. Target around ${requestedLength} words and do not stop early unless you hit a hard token limit.`
                },
                { role: "user", content: prompt }
            ],
            max_tokens: maxTokens,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};





export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        const response = await AI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [ { role: "user", content: prompt }],
            max_tokens: 100,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};



export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;
        

        if (plan !== 'premium' ) {
            return res.json({ success: false, message: "THIS FEATURE IS ONLY AVAILABLE TO PREMIUM SUBSCTPTIONS." });
        }

        
const formData = new FormData()
formData.append('prompt', prompt)
const {data}= await axios.post("https://clipdrop-api.co/text-to-image/v1",formData,{
    headers:{
        "x-api-key": process.env.CLIPDROP_API_KEY,},
        responseType:"arraybuffer",
    })


const base64Image= `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`;
connectCloudinary();
       const {secure_url}=await cloudinary.uploader.upload(base64Image)


        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};







export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan;

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file" });
        }
        

        if (plan !== 'premium' ) {
            return res.json({ success: false, message: "THIS FEATURE IS ONLY AVAILABLE TO PREMIUM SUBSCTPTIONS." });
        }


       const imageDataUri = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`

       const {secure_url}=await cloudinary.uploader.upload(imageDataUri,{
        transformation:[
            {
                effect:'background_removal',
                background_removal:'remove_the_background'
            }
        ]
       })


        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${'Background Removed'}, ${secure_url}, 'image')`;
       
        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};





export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan;

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file" });
        }

        if (!object?.trim()) {
            return res.json({ success: false, message: "Please provide an object name to remove" });
        }
        

        if (plan !== 'premium' ) {
            return res.json({ success: false, message: "THIS FEATURE IS ONLY AVAILABLE TO PREMIUM SUBSCTPTIONS." });
        }


       const imageDataUri = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`

       const {public_id}=await cloudinary.uploader.upload(imageDataUri)
       const imageUrl =cloudinary.url(public_id,{
        transformation:[{effect:`gen_remove:${object}`}],
        resource_type:'image'
       })

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;
// publish ==publish as I have written the in the sql query publish==publish , spell mistake , sorry!
    
        res.json({ success: true, content:imageUrl });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};









export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if (!resume) {
            return res.json({ success: false, message: "Please upload a resume file" });
        }

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available to premium subscriptions." });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "File size should be less than 5MB" });
        }

        const buffer = new Uint8Array(resume.buffer);
        const { text } = await extractText(buffer, { mergePages: true });

        const prompt = `Review the following resume and provide detailed feedback on how to improve it. Highlight areas that could be enhanced such as formatting, content, or structure.\n\nResume:\n\n${text}`;

        const response = await AI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type) 
                  VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

        res.json({ success: true, content });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};