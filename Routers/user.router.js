import express from "express"
import {activateUser, changePassword, forgetPassword, getAllUsers, resendOTP, userLogin, userRegister } from "../Controllers/user.controller.js"
import authMiddleware from "../Middlewares/authMiddleware.js"

const router = express.Router()


router.post('/signup',userRegister)
router.post('/accountactivation',activateUser)
router.post('/resend-otp',resendOTP)
router.post('/login',userLogin)
router.post('/forgot-password',forgetPassword)
router.post('/change-password',changePassword)

router.get('/getallusers',authMiddleware('admin'),getAllUsers)


export default router