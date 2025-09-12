import express from 'express'
import { addToCart, bookTour, bookTourByAdmin, cancelBookingByAdmin, confirmBookingByAdmin, createNewTour, deleteEnquiry, deleteTourGalleryImage, deleteTourPlan,editTour,filterTours,getAllBookings,getAllTours, getAllToursForAdmin,getCountryLists, getEnquiry, getTourDetailsByID, getUserBookingHistory, getUserCartList, getUserUpcomingBookings, removeFromCart, sendEnquiry, uploadTourGallery } from '../Controllers/tour.controller.js'
import authMiddleware from '../Middlewares/authMiddleware.js'
import { handleMulterErrors, upload } from '../Middlewares/multer.js'

const router = express.Router()

router.post('/create_tour',authMiddleware('admin'), createNewTour)
router.patch('/edit_tour/:tourId',authMiddleware('admin'),editTour)
router.delete('/delete_tour/:tourId',authMiddleware('admin'), deleteTourPlan)
router.get('/get_all_tours',authMiddleware(['admin','user']),getAllTours)
router.get('/get-tour/:id',authMiddleware(['admin','user']),getTourDetailsByID)
router.get('/get-alltours-admin',authMiddleware('admin'),getAllToursForAdmin)
router.get('/get-country-list',authMiddleware(['admin','user']),getCountryLists)
router.post('/book-tour/:tourId',authMiddleware(['admin','user']),bookTour)
router.post('/book-tour-byadmin',authMiddleware('admin'),bookTourByAdmin)
router.get('/get-all-bookings',authMiddleware('admin'),getAllBookings)
router.patch('/confirm-booking/:id',authMiddleware('admin'),confirmBookingByAdmin)
router.patch('/cancel-booking/:id',authMiddleware('admin'),cancelBookingByAdmin)
router.post('/upload-images/:tourId',authMiddleware('admin'),upload.array('images',10),handleMulterErrors,uploadTourGallery)
router.delete("/delete-image/:tourId", authMiddleware('admin'), deleteTourGalleryImage);
router.post('/filter-tour',authMiddleware(['admin','user']),filterTours)
router.post('/send-enquiry',authMiddleware('user'),sendEnquiry)
router.get('/get-enquiry',authMiddleware('admin'),getEnquiry)
router.delete('/delete-enquiry/:id',authMiddleware('admin'),deleteEnquiry)
router.post('/addtocart/:id',authMiddleware('user'),addToCart)
router.get('/get-user-cartdetails',authMiddleware('user'),getUserCartList)
router.delete('/remove-from-cart/:id',authMiddleware('user'),removeFromCart)
router.get('/get-upcomming-bookings',authMiddleware('user'),getUserUpcomingBookings)
router.get('/get-booking-history',authMiddleware('user'),getUserBookingHistory)



export default router