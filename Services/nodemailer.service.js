import { createTransport } from "nodemailer"
import dotenv from "dotenv"
dotenv.config()



export const accountactivationMail = async(email,OTP) =>{
    try {
        const transport = createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        const details = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to Wild Lens Tour - Activate Your Account",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Welcome to Wild Lens Tour! 🌍</h2>
                    <p>We're excited to have you on board. Wild Lens Tour is your trusted partner for unforgettable wildlife adventures, offering the best tour booking services across the globe.</p>
                    <p><strong>Your account activation OTP is:</strong></p>
                    <h1 style="color: #2e8b57;">${OTP}</h1>
                    <p>Please enter this OTP to activate your account and start exploring amazing destinations.</p>
                    <hr />
                    <p style="font-size: 0.9em; color: #666;">
                        If you didn’t sign up for Wild Lens Tour, please ignore this message.
                    </p>
                </div>
            `
        }
        await transport.sendMail(details)
        console.log("Account Activation Email sent successfully")
    } catch (error) {
        console.error("Failed to send email:", error)
    }
};



export const forgetPasswordmail = async(email,pwdVerifyString)=>{
    try {
        const transport =createTransport({
            service:"gmail",
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
    
        })
        let details = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Wild Lens Tour – Change Your Password",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Reset Your Password 🔒</h2>
                    <p>Hi there,</p>
                    <p>We received a request to reset the password for your Wild Lens Tour account. If you initiated this request, please use the OTP below to proceed:</p>
                    <h1 style="color: #2e8b57;">${pwdVerifyString}</h1>
                    <p>This OTP is valid for a limited time. Please do not share it with anyone.</p>
                    <p>If you didn’t request a password change, you can safely ignore this message — your password will remain unchanged.</p>
                    <hr />
                    <p style="font-size: 0.9em; color: #666;">
                        Need help? Contact our support team at support@wildlenstour.com.<br />
                        Thank you for choosing Wild Lens Tour!
                    </p>
                </div>
            `
        }
        
        await transport.sendMail(details)
        console.log("Forget Password Email sent successfully")
        
    } catch (error) {
        console.error("Failed to send email:", error)
        
    }
   
}