import mongoose from "mongoose";


const enquirySchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone_number:{
        type:Number,
        required:true,
    },
    comments:{
        type:String,
        required:true
    },
},{
    timestamps:true
})

const Enquiry = mongoose.model("enquires",enquirySchema)
export default Enquiry