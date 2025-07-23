import User from "../Models/user.schema.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendResponse } from "../Utils/response.js";
import { accountactivationMail, forgetPasswordmail } from "../Services/nodemailer.service.js";

dotenv.config();

export const userRegister = async (req, res) => {
  const { user_name, email, password } = req.body;
  if(!user_name || !email || !password){
    return sendResponse(res, 200, "All the fileds are required",[],400,false)
  } 
  try {
    const user = await User.findOne({ email });
    if (user) {
      return sendResponse(res, 200, "User already exists",[],409,false)
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
    await accountactivationMail(email,otp)
    return sendResponse(res,200,"Account Activation link send to your mail",[],201,true)
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

export const activateUser = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if(!email|| !otp){
      return sendResponse(res, 200, "All the fileds are required",[],400,false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res,200,"Invalid Email",[],400,false)
    }

    if (user.activation_status === true) {
      return sendResponse(res,200,"Account Already Activated",[],400,false)
    }

    if(user.otp === null){
      return sendResponse(res,200,"OTP expired Please click Resend OTP",[],400,false)
    }

    if (user.otp !== Number(otp)|| user.otp_expiry < Date.now()) {
        user.otp = null, 
        user.otp_expiry = null,
        await user.save()

      return sendResponse(res,200,"Invalid OTP or OTP expired",[],400,false)
    }

    user.activation_status = true,
    user.otp = null, 
    user.otp_expiry = null;

    await user.save();
    return sendResponse(res,200,"User activation completed succesfully",[],201,true)
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};
export const resendOTP = async(req,res)=>{
try {
  const {email}=req.body
  if(!email){
    return sendResponse(res, 200, "Email is required",[],400,false)
  }
  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, 200, "Invalid email",[],400,false);
  }

  if (user.activation_status === true) {
    return sendResponse(res, 200, "Account already activated",[],400,false);
  }
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  const otp = generateOTP();
  const otp_expiry = new Date().getTime() + 600000;

  user.otp=otp;
  user.otp_expiry=otp_expiry
  await accountactivationMail(email,otp)
  await user.save()
  return sendResponse(res, 200, "OTP sent to your register Email",[],200,true);

} catch (error) {
  console.log(error);
  return sendResponse(res, 500, "Internal Server Error");
  
}

}
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email|| !password){
      return sendResponse(res, 200, "All the fileds are required",[],400,false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid email",[],400,false);
      
    }
    if (user.activation_status === false) {
      return sendResponse(res, 200, "Account not activated",[],401,false);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendResponse(res, 200, "Invalid password",[],401,false);
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
      201,true);
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if(!email){
      return sendResponse(res, 200, "Email is required",[],400,false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid email",[],400,false);
    }
    if (user.activation_status === false) {
      return sendResponse(res, 200, "Account not activated",[],401,false);
    }
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000);
    }
    const pwd_verify_string = generateOTP();
    const reset_time = new Date().getTime()+ 600000;
    user.reset_time = reset_time;
    user.pwd_verify_string = pwd_verify_string;

    await user.save();
    await forgetPasswordmail(email,pwd_verify_string)
    return sendResponse(res, 200, "OTP sent to your register E-mail",[],200,true);
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

export const changePassword = async (req, res) => {
  try {
    const { pwd_verify_string, password,email } = req.body;
    if(!pwd_verify_string || !password || !email){
      return sendResponse(res, 200, "All the field is required",[],400,false)
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 200, "Invalid user",[],400,false);
    }
    if (user.pwd_verify_string !==pwd_verify_string) {
      return sendResponse(res, 200, "Invalid otp",[],400,false);
    }
    if (user.activation_status === false) {
      return sendResponse(res, 200, "Account not activated",[],401,false);
    }

    const current_time = new Date().getTime();
    if (user.reset_time < current_time) {
        user.pwd_verify_string = null;
        user.reset_time = null;
        await user.save();

    return sendResponse(res, 200, "OTP expired",[],401,false);
    }
 
    const hashPashword = await bcrypt.hash(password, 10);
    user.password = hashPashword;
    user.pwd_verify_string = null;
    user.reset_time = null;

    await user.save();
    return sendResponse(res, 200, "password successfully changed",[],201,true);
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

export const getAllUsers = async(req,res)=>{

  try {
    const users = await User.find()
    return sendResponse(res,200,"Users Details Send Succesfully",users,201,true)
  } catch (error) {
    console.log(error)
    return sendResponse(res, 500, "Internal Server Error");
    
  }

}
