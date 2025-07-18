import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../Models/user.schema.js";
import { sendResponse } from "../Utils/response.js";

dotenv.config()


const authMiddleware = (allowedRoles)=> async(req,res,next)=>{

    const token =  req.headers?.authorization?.split(' ')[1];
    if(!token){
        return sendResponse(res, 401, "Token is missing", null, 401, false);
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded;

        const user = await User.findById(req.user._id)
        if(!user){
            return sendResponse(res, 401, "Un Authorized User", null, 401, false);
        }
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!roles.includes(user.userRole)) {
            return sendResponse(res, 403, "Unauthorized user role", null, 403, false);
          }
        next()
        
    } catch (error) {
       console.log(error)
       if(error.name === "TokenExpiredError"){
        sendResponse(res,401,"Token expired",null,401,false)
       }
       sendResponse(res,500,"Internal server error",null,500,false)
    }
}

export default authMiddleware