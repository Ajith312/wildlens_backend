import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        trim: true
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
    }
}, {
    timestamps: true
});

const User = mongoose.model("users", userSchema);
export default User;
