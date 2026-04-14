import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserCreation, getPublishedCreation, toggleLikeCreation } from "../controllers/usercontroller.js";
const userRouter = express.Router();


userRouter.get('/get-user-creations',auth, getUserCreation)
userRouter.get('/get-published-creations', getPublishedCreation)
userRouter.post('/toggle-like-creation',auth, toggleLikeCreation)



export default userRouter;
