import { createTransport } from "nodemailer"
import dotenv from "dotenv"
dotenv.config()



export const accountactivationMail = (email,OTP) =>{
    const transport = createTransport({
        service:"gmail",
        auth:{
            user: process.env.USER,
            pass: process.env.PASS,
        }
    })

    let details = {
        from:process.env.USER,
        to:email,
        subject:"Accout Activation",
        html:``
    };
    transport.sendMail(details,(err)=>{
        if(err) {
            console.log("Check Credentials");
    } else {
        console.log("Email sent successfully");
    }
    })
}


export const forgetPasswordmail = (email,pwdVerifyString)=>{
    const transport =createTransport({
        service:"gmail",
        auth:{
            user: process.env.USER,
            pass: process.env.PASS,
        }

    })
    let details = {
        from:process.env.USER,
        to:email,
        subject:"Reset Password",
        html:``
    };
    transport.sendMail(details,(err)=>{
        if(err) {
            console.log("Check Credentials");
    } else {
        console.log("Email sent successfully");
    }
    })
}