import express from "express"
import {activateUser, changePassword, forgetPassword, getAllUsers, getProfileDetails, getRefreshToken, getUserDetails, resendOTP, uploadProfilePictute, userLogin, userRegister } from "../Controllers/user.controller.js"
import authMiddleware from "../Middlewares/authMiddleware.js"
import { handleMulterErrors, upload } from "../Middlewares/multer.js"

const router = express.Router()


router.post('/signup',userRegister)
router.post('/accountactivation',activateUser)
router.post('/resend-otp',resendOTP)
router.post('/login',userLogin)
router.post('/forgot-password',forgetPassword)
router.post('/change-password',changePassword)
router.get('/get-referesh-token',getRefreshToken)

router.get('/get-profile-details',authMiddleware(['admin','user']),getProfileDetails)
router.get('/get-all-users',authMiddleware('admin'),getAllUsers)
router.get('/get-user-details/:userId',authMiddleware('admin'),getUserDetails)
router.post('/upload-profileimage',authMiddleware(['admin','user']),upload.single('image'),handleMulterErrors,uploadProfilePictute)


export default router