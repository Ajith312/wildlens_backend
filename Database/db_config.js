import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { sendResponse } from '../Utils/response.js'

dotenv.config()

const connectDb = async(req,res)=>{
    try {
        const connection =  await mongoose.connect(process.env.MONGODB_URI)
        console.log("DB Connected")
        return connection
        
    } catch (error) {
        console.error('DB Connection Error:', error.message);
        return sendResponse(res, 500, "Internal Server Error");
    }

}

export default connectDb