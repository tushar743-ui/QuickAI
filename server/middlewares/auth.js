import { clerkClient } from "@clerk/express";





// Midlleware to check userId and hasPremium


export const auth = async(req , res ,next)=>{
    try {
        const {userId , has }= await req.auth();
        const hasPremiumPlan = await has({plan : 'premium' });

        const user = await clerkClient.users.getUser(userId);

       // Use fre uage for non -premium users ; otherwise reset their free usage to zero 
        if(!hasPremiumPlan && user.privateMetadata.free_usage){
            req.free_usage = user.privateMetadata.free_usage
        }else{
            await clerkClient.users.updateUserMetadata(userId,{
               privateMetadata:{
                free_usage:0
               } 
            })
            req.free_usage=0;
        }

        req.plan= hasPremiumPlan ? 'premium' : 'free_user';
        next()
    } catch (error) {
         res.json({success :free , message :error.message})
    } 
}
