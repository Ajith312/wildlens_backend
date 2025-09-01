import User from "../Models/user.schema.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendResponse } from "../Utils/response.js";
import { accountactivationMail, forgetPasswordmail } from "../Services/nodemailer.service.js";
import mongoose from "mongoose";
import cloudinary from "../Utils/cloudinary.js";

dotenv.config();

export const userRegister = async (req, res) => {
  const { user_name, email, password } = req.body;
  if (!user_name || !email || !password) {
    return sendResponse(res, 200, "All the fileds are required", [], 400, false)
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      return sendResponse(res, 200, "User already exists", [], 409, false)
    }
    const hashPassword = await bcrypt.hash(password, 10);

    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000);
    }
    const otp = generateOTP();
    const otp_expiry = new Date().getTime() + 600000;

    const newUser = new User({
      user_name,
      email,
      password: hashPassword,
      otp,
      otp_expiry,
      user_role: "user",
    });
    await newUser.save();
    await accountactivationMail(email, otp)
    return sendResponse(res, 200, "Account Activation link send to your mail", [], 201, true)
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

export const activateUser = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendResponse(res, 200, "All the fileds are required", [], 400, false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid Email", [], 400, false)
    }

    if (user.activation_status === true) {
      return sendResponse(res, 200, "Account Already Activated", [], 400, false)
    }

    if (user.otp === null) {
      return sendResponse(res, 200, "OTP expired Please click Resend OTP", [], 400, false)
    }

    if (user.otp !== Number(otp) || user.otp_expiry < Date.now()) {
      user.otp = null,
        user.otp_expiry = null,
        await user.save()

      return sendResponse(res, 200, "Invalid OTP or OTP expired", [], 400, false)
    }

    user.activation_status = true,
      user.otp = null,
      user.otp_expiry = null;

    await user.save();
    return sendResponse(res, 200, "User activation completed succesfully", [], 201, true)
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return sendResponse(res, 200, "Email is required", [], 400, false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid email", [], 400, false);
    }

    if (user.activation_status === true) {
      return sendResponse(res, 200, "Account already activated", [], 400, false);
    }
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000);
    }
    const otp = generateOTP();
    const otp_expiry = new Date().getTime() + 600000;

    user.otp = otp;
    user.otp_expiry = otp_expiry
    await accountactivationMail(email, otp)
    await user.save()
    return sendResponse(res, 200, "OTP sent to your register Email", [], 200, true);

  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");

  }

}
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, 200, "All the fileds are required", [], 400, false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid email", [], 400, false);

    }
    if (user.activation_status === false) {
      return sendResponse(res, 200, "Account not activated", [], 401, false);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendResponse(res, 200, "Invalid password", [], 401, false);
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    user.token = token;
    await user.save();
    return sendResponse(res, 200, "User login succesfully",
      {
        token: token,
        role: user.user_role
      },
      201, true);
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendResponse(res, 200, "Email is required", [], 400, false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid email", [], 400, false);
    }
    if (user.activation_status === false) {
      return sendResponse(res, 200, "Account not activated", [], 401, false);
    }
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000);
    }
    const pwd_verify_string = generateOTP();
    const reset_time = new Date().getTime() + 600000;
    user.reset_time = reset_time;
    user.pwd_verify_string = pwd_verify_string;

    await user.save();
    await forgetPasswordmail(email, pwd_verify_string)
    return sendResponse(res, 200, "OTP sent to your register E-mail", [], 200, true);
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

export const changePassword = async (req, res) => {
  try {
    const { pwd_verify_string, password, email, current_password } = req.body

    if (!password || !email) {
      return sendResponse(res, 200, "Email and new password are required", [], 400, false)
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid user", [], 401, false)
    }

    if (!user.activation_status) {
      return sendResponse(res, 200, "Account not activated", [], 400, false)
    }

    if (current_password && !pwd_verify_string) {
      const isMatch = await bcrypt.compare(current_password, user.password)
      if (!isMatch) {
        return sendResponse(res, 200, "Old password is incorrect", [], 400, false)
      }
    }

    else if (pwd_verify_string && !current_password) {
      if (user.pwd_verify_string !== pwd_verify_string) {
        return sendResponse(res, 200, "Invalid OTP", [], 400, false)
      }
      if (user.reset_time < Date.now()) {
        user.pwd_verify_string = null
        user.reset_time = null
        await user.save()
        return sendResponse(res, 200, "OTP expired", [], 403, false)
      }
    }

    else {
      return sendResponse(res, 200, "Provide either old password or OTP, not both", [], 400, false);
    }


    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.pwd_verify_string = null;
    user.reset_time = null;
    await user.save();

    return sendResponse(res, 200, "Password successfully changed", [], 200, true);

  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

 export const getProfileDetails = async(req,res)=>{
  try {
    const userId = req.user._id
    if(!userId){
       return sendResponse(res, 200, "Invalid User id", [], 400, false)
    }

    const user = await User.findOne({_id:userId},{_id:0,user_name:1,email:1,phone_number:1,date_of_birth:1,profile_picture:1})
    if(!user){
      return sendResponse(res,200,"User not found",[],401,false)
    }
    sendResponse(res,200,"User Details send succesfully",user,200,true)
    
  } catch (error) {
    console.log("Error in getProfileDetails",error);
    return sendResponse(res, 500, "Internal Server Error");
    
  }
 }

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([{
      $match: {
        user_role: "user"
      }
    },
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "user_id",
        as: "booking_details"
      }
    },
    {
      $project: {
        user_name: 1,
        email: 1,
        createdAt: 1,
        profile_picture:1,
        totalBookings: { $size: "$booking_details" }
      }
    }
    ])
    return sendResponse(res, 200, "Users Details Send Succesfully", users, 200, true)
  } catch (error) {
    console.log("Error in getAllUsers", error)
    return sendResponse(res, 500, "Internal Server Error");

  }

}

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 200, "Invalid user", null, 404, false)
    }

    const objectId = mongoose.Types.ObjectId.createFromHexString(userId)

    const details = await User.aggregate([
      {
        $match: {
          _id: objectId,
          user_role: "user"
        }
      },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "user_id",
          as: "booking_details"
        }
      },
      { $unwind: "$booking_details" },
      {
        $lookup: {
          from: "tours",
          localField: "booking_details.tour_id",
          foreignField: "_id",
          as: "tour_details"
        }
      },
      { $unwind: "$tour_details" },
      {
        $group: {
          _id: "$_id",
          user_name: { $first: "$user_name" },
          email: { $first: "$email" },
          profile_picture:{$first:"$profile_picture"},
          join_date:{$first:"$createdAt"},
          phone_number:{$first:"$phone_number"},
          booking_details: {
            $push: {
              booking_date: "$booking_details.booking_date",
              persons: "$booking_details.number_of_persons",
              payment_status: "$booking_details.payment_status",
              booking_status: "$booking_details.booking_status",
              tour_status:"$booking_details.tour_status",
              title: "$tour_details.title",
              budget: "$tour_details.budget"
            }
          },
          total_bookings: { $sum: 1 },
          total_amount: { $sum: "$tour_details.budget" }
        }
      }
    ])

    return sendResponse(res, 200, "User details sent successfully", details[0], 200, true);

  } catch (error) {
    console.log("Error in getUserDetails", error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

export const getRefreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, 401, "Token is missing or invalid", null, 401, false)
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.decode(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendResponse(res, 401, "Invalid or expired token", null, 401, false)
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return sendResponse(res, 401, "Invalid user", null, 401, false)
    }
    const newToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    return sendResponse(res, 200, "Refresh token sent successfully", { token: newToken }, 200, true)
  } catch (error) {
    console.error("Error in getRefreshToken:", error.message);
    return sendResponse(res, 500, "Internal Server Error");
  }
};


export const uploadProfilePictute = async (req, res) => {
  try {
    const userId = req.user._id
    if (!req.file) {
      return sendResponse(res, 400, "No image file provided")
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64")
     const dataURI = `data:${req.file.mimetype};base64,${b64}`
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "profile_pictures",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" }
      ]
    })

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_picture: result.secure_url },
      { new: true })

    if (!updatedUser) {
      return sendResponse(res, 404, "User not found")
    }

    return sendResponse(res,200,"Profile picture uploaded successfully",{profile_picture: result.secure_url},true);
  } catch (error) {
    console.error("Error in uploadProfilePictute:", error.message);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};
