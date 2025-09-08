import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name:{
         type: String,
          trim: true
    },
    address:{
        type:String
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    user_role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
        required:true
    },
    token: {
        type: String,
        default: null,
    },
    profile_picture:{
        type:String

    },
    profile_picture_public_id: { 
        type: String 
    },
    otp: {
        type: Number,
        default: null
    },
    otp_expiry: {
        type: Date,
        default: null,
    },
    activation_status: {
        type: Boolean,
        default: false,
    },
    pwd_verify_string: {
        type: Number,
        default: null,
    },
    reset_time: {
        type: Number,
        default: null,
    },
    phone_number:{
        type:Number
    },
    date_of_birth:{
        type:String
    },
}, {
    timestamps: true
});

const User = mongoose.model("users", userSchema);
export default User;
