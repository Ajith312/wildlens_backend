import Tour from "../Models/tour.schema.js";
import User from "../Models/user.schema.js";
import Booking from "../Models/booking.schema.js";
import { sendResponse } from "../Utils/response.js";
import { validateTourPayload } from "../Utils/validateTourPayload.js";
import { toTitleCase } from "../Utils/stringFunction.js";
import Enquiry from "../Models/enquiry.schema.js";
import Cart from "../Models/cart.schema.js";
import mongoose from "mongoose";
import cloudinary from "../Utils/cloudinary.js";


export const createNewTour = async (req, res) => {
  try {
    const tourDetails = req.body
    if (!tourDetails || Object.keys(tourDetails).length === 0) {
      return sendResponse(res, 200, "Tour details are required", null, 400, false)
    }

    tourDetails.country = toTitleCase(tourDetails.country.trim())
    const { isValid, message } = validateTourPayload(tourDetails)
    if (!isValid) {
      return sendResponse(res, 200, message, null, 400, false)
    }

    const existingTour = await Tour.findOne({
      title: tourDetails.title,
      country: tourDetails.country,
      days: tourDetails.days
    })

    if (existingTour) {
      return sendResponse(res, 200, 'Tour for this title and country already exists.', null, 409, false)
    }
    const newTour = new Tour(tourDetails)
    await newTour.save()
    return sendResponse(res, 201, 'Tour created successfully', newTour, 201, true);

  } catch (error) {
    console.error('createNewTour error:', error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
  }
}

export const editTour = async (req, res) => {
  try {
    const { tourId } = req.params
    const tourDetails = req.body

    if (!tourDetails || Object.keys(tourDetails).length === 0) {
      return sendResponse(res, 200, "Tour details are required", null, 400, false)
    }
    const existingTour = await Tour.findById(tourId)
    if (!existingTour) {
      return sendResponse(res, 200, "Invalid Tour", null, 404, false)
    }
    if (tourDetails.country) {
      tourDetails.country = toTitleCase(tourDetails.country.trim())
    }
    const { isValid, message } = validateTourPayload(tourDetails)
    if (!isValid) {
      return sendResponse(res, 400, message, null, 400, false)
    }

    const updatedTour = await Tour.findByIdAndUpdate(tourId, tourDetails, {
      new: true,
      runValidators: true
    })
    return sendResponse(res, 200, 'Tour updated successfully', updatedTour, 200, true)

  } catch (error) {
    console.error('editTourPlan error:', error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
  }
}
export const deleteTourPlan = async (req, res) => {
  try {
    const { tourId } = req.params
    if (!tourId) {
      return sendResponse(res, 400, 'Tour Id is required', null, 400, false)
    }
    const existingTour = await Tour.findById(tourId);
    if (!existingTour) {
      return sendResponse(res, 404, 'Tour not found', null, 404, false);
    }

    await Tour.findByIdAndUpdate(tourId,{is_deleted:true})
    return sendResponse(res, 200, 'Tour deleted successfully', null, 200, true)

  } catch (error) {
    console.error('deleteTourPlan error:', error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
  }
}
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({is_deleted:false},
      {
        createdAt: 0,
        updatedAt: 0,
        "places_covered._id": 0,
        "__v": 0
      }).sort({ createdAt: -1 })
    return sendResponse(res, 200, 'Tour Details send successfully', tours, 200, true)

  } catch (error) {
    console.error('getAllTours error:', error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)

  }
}

export const getTourDetailsByID = async (req, res) => {
  try {
    const tourId = req.params.id

    const tour = await Tour.findOne(
      { _id: tourId, is_deleted: false },
      {
        createdAt: 0,
        updatedAt: 0,
        "places_covered._id": 0,
        "__v": 0
      }
    )

    if (!tour) {
      return sendResponse(res, 200, "Tour not found", null, 404, false)
    }

    return sendResponse(res, 200, "Tour details fetched successfully", tour, 200, true)
  } catch (error) {
    console.error("getTourDetailsByID error:", error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
}


export const getAllToursForAdmin = async (req,res)=>{
  try {
     const tours = await Tour.find({is_deleted:false},
      {
        _id:1,
        title:1,
      }).sort({ createdAt: -1 })

      if(tours && tours.length>0){
          return sendResponse(res, 200, 'Tour Details send successfully', tours, 200, true)
      }else{
          return sendResponse(res, 200, 'Tour Details send successfully', [], 200, true)
      }
     
    
  } catch (error) {
    console.error('getAllTours error:', error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
  }
}

export const getCountryLists = async (req,res)=>{
  try {
    const countries  = await Tour.distinct("country")
    if(countries && countries.length > 0){
      return sendResponse(res,200,"country details fetched succesfully",countries,200,true)
    }else{
      return sendResponse(res,200,"No countries Available",[],200,true)
    }
  } catch (error) {
    console.log('Error in getCountryLists :',error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
  }
}

export const bookTour = async (req, res) => {
  try {
    const userId = req.user._id
    const bookingDetails = req.body
    const { tourId } = req.params

    const tour = await Tour.findById(tourId)
    if (!tour) {
      return sendResponse(res, 200, "Invalid Tour Packages", null, 404, false)
    }
    
    const requiredFields = ['first_name', 'last_name', 'address', 'booking_date'];
    for (let field of requiredFields) {
      if (!bookingDetails[field]) {
        return sendResponse(res, 400, `Missing required field: ${field}`, null, 400, false);
      }
    }

    const newBooking = {
      user_id: userId,
      tour_id: tourId,
      ...bookingDetails
    }

    const booking = new Booking(newBooking)
    booking.save()

    return sendResponse(res, 200, "Booking created succesfully", null, 200, true)


  } catch (error) {
    console.log("Error in bookTour",error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)

  }
}

export const bookTourByAdmin = async (req, res) => {
  try {
    const bookingDetails = req.body


    const tour = await Tour.findById(bookingDetails?.tour_id)
    if (!tour) {
      return sendResponse(res, 200, "Invalid Tour Packages", null, 404, false)
    }
     const user = await User.findById(bookingDetails?.user_id)
       if (!user) {
      return sendResponse(res, 200, "Invalid User", null, 404, false)
    }
    
    const requiredFields = ['first_name', 'last_name', 'address', 'booking_date']
    for (let field of requiredFields) {
      if (!bookingDetails[field]) {
        return sendResponse(res, 400, `Missing required field: ${field}`, null, 400, false)
      }
    }
    console.log(bookingDetails,'bookingDetails')
    const newBooking = {
      ...bookingDetails
    }

    const booking = new Booking(newBooking)
    booking.save()

    return sendResponse(res, 200, "Booking created succesfully", null, 200, true)


  } catch (error) {
    console.log("Error in bookTour",error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)

  }
}

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id
    const userId = req.user._id

    if (!bookingId) {
      return sendResponse(res, 200, "Booking id is missing", [], 400, false)
    }


    const booking = await Booking.findOne({ _id: bookingId, user_id: userId })
    if (!booking) {
      return sendResponse(res, 200, "Invalid user or booking not found", [], 404, false)
    }


    booking.booking_status = "cancelled"
    // booking.tour_status = "cancelled"
    await booking.save()

    return sendResponse(res, 200, "Booking cancelled successfully", booking, 200, true)

  } catch (error) {
    console.log("Error in cancelBooking:", error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
};


export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const perPage = parseInt(limit)


    const matchStage = {}
    if (status != "all") {
      if (status) {
        matchStage.booking_status = status
      }
    }
    if (search) {
      matchStage.$or = [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
        { "Tour_Details.title": { $regex: search, $options: "i" } },
        { "Tour_Details.country": { $regex: search, $options: "i" } }
      ]
    }

    const result = await Booking.aggregate([
      {
        $lookup: {
          from: "tours",
          localField: "tour_id",
          foreignField: "_id",
          as: "Tour_Details"
        }
      },
      { $unwind: "$Tour_Details" },

      {
        $facet: {
          details: [
            { $match: matchStage },
            {
              $project: {
                first_name: 1,
                last_name: 1,
                booking_date: 1,
                booking_status: 1,
                payment_status: 1,
                number_of_persons:1,
                guide_required:1,
                comments:1,
                address:1,
                title: "$Tour_Details.title",
                country: "$Tour_Details.country",
                budget: "$Tour_Details.budget",
                plan_title: "$Tour_Details.plan_title"
              }
            },
            { $sort: { createdAt: -1 } },
            // { $skip: skip },
            // { $limit: perPage }
          ],
          stats: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                completedCount: {
                  $sum: { $cond: [{ $eq: ["$booking_status", "completed"] }, 1, 0] }
                },
                pendingCount: {
                  $sum: { $cond: [{ $eq: ["$booking_status", "pending"] }, 1, 0] }
                },
                cancelledCount: {
                  $sum: { $cond: [{ $eq: ["$booking_status", "cancelled"] }, 1, 0] }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          details: 1,
          stats: { $arrayElemAt: ["$stats", 0] }
        }
      }
    ])


    const bookings = result[0] || { details: [], stats: {} }

    return sendResponse(
      res,200,"Booking details fetched successfully",{...bookings,page: parseInt(page),limit: perPage},200,true)
  } catch (error) {
    console.error(error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false);
  }
};

export const confirmBookingByAdmin = async (req,res)=>{
  try {
    const bookingId = req.params.id
    if (!bookingId) {
      return sendResponse(res, 200, "Booking id is missing", null, 400, false)
    }
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { booking_status: "confirmed", tour_status: "confirmed" },
      { new: true }
    )
    if (!booking) {
      return sendResponse(res, 200, "Invalid Booking", null, 404, false)
    }
    return sendResponse(res, 200, "Booking confirmed", null, 200, true)

  } catch (error) {
     console.error(error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false);
  }
}

export const cancelBookingByAdmin = async (req,res)=>{
  try {
    const bookingId = req.params.id
    if (!bookingId) {
      return sendResponse(res, 200, "Booking id is missing", null, 400, false)
    }
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { booking_status: "cancelled", tour_status: "cancelled" },
      { new: true }
    )
    if (!booking) {
      return sendResponse(res, 200, "Invalid Booking", null, 404, false)
    }
    return sendResponse(res, 200, "Booking Cancelled", null, 200, true)

  } catch (error) {
     console.error(error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false);
  }
}

export const uploadTourGallery = async (req, res) => {
  try {
    const { tourId } = req.params

    if (!req.files || req.files.length === 0) {
      return sendResponse(res, 400, "Please upload at least one image", null, 400, false)
    }

    const tourExists = await Tour.findById(tourId)
    if (!tourExists) {
      return sendResponse(res, 404, "Tour not found", null, 404, false)
    }

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((file) => {
      const b64 = Buffer.from(file.buffer).toString("base64")
      const dataURI = `data:${file.mimetype};base64,${b64}`

      return cloudinary.uploader.upload(dataURI, {
        folder: `tours/${tourId}/gallery`,
        transformation: [{ width: 1600, height: 900, crop: "fill", quality: "auto" }]
      })
    })

    const uploadResults = await Promise.all(uploadPromises)

    const images = uploadResults.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id
    }))

    // Save images in DB
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      { $push: { image_gallery: { $each: images } } },
      { new: true, runValidators: true }
    )

    return sendResponse(
      res,
      200,
      `${images.length} images added to gallery`,
      {
        gallery: updatedTour.image_gallery,
        total_images: updatedTour.image_gallery.length,
      },
      200,
      true
    )
  } catch (error) {
    console.error("Gallery upload error:", error)
    return sendResponse(res, 500, error.message || "Failed to upload gallery images")
  }
}
export const deleteTourGalleryImage = async (req, res) => {
  try {
    const { tourId } = req.params
    const { public_id } = req.query

    if (!public_id) {
      return sendResponse(res, 400, "Public ID is required", null, 400, false)
    }

    const tour = await Tour.findById(tourId)
    if (!tour) {
      return sendResponse(res, 404, "Tour not found", null, 404, false)
    }


    const imageExists = tour.image_gallery.some(img => img.public_id === public_id)
    if (!imageExists) {
      return sendResponse(res, 404, "Image not found in this tour", null, 404, false)
    }

    const cloudinaryResponse = await cloudinary.uploader.destroy(public_id, { invalidate: true })

    if (cloudinaryResponse.result !== "ok" && cloudinaryResponse.result !== "not found") {
      return sendResponse(res, 500, "Failed to delete from Cloudinary", cloudinaryResponse, 500, false)
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      { $pull: { image_gallery: { public_id } } },
      { new: true }
    )

    return sendResponse(res,200,"Image deleted successfully",
      {gallery: updatedTour.image_gallery,
        total_images: updatedTour.image_gallery.length,
      },200,true
    )
  } catch (error) {
    console.error("Delete image error:", error)
    return sendResponse(res, 500, error.message || "Failed to delete image")
  }
}

export const filterTours = async (req, res) => {
  try {
    const { country, min_price, max_price, duration } = req.body
    let filter = {}
    if (country && country.trim() !== "all") {
      filter.country = country
    }

    if (duration && duration !== "all") {
      filter.days = Number(duration)
    }

   if (!(min_price == 0 && max_price == 0)) {
      filter.budget = {};
      if (min_price && Number(min_price) > 0) {
        filter.budget.$gte = Number(min_price);
      }
      if (max_price && Number(max_price) > 0) {
        filter.budget.$lte = Number(max_price);
      }
    }

    const tours = await Tour.find(filter,{
        createdAt: 0,
        updatedAt: 0,
        "places_covered._id": 0,
        "__v": 0
      }).sort({ createdAt: -1 })

    if (tours.length > 0) {
      return sendResponse(res, 200, "Tours fetched successfully", tours, 200, true)
    } else {
      return sendResponse(res, 200, "No tours found", [], 200, true)
    }
  } catch (error) {
    console.log("Error in filterTours:", error);
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
};

export const sendEnquiry = async (req, res) => {
  try {
    const { name, email, phone_number, comments } = req.body
    const userId = req.user?._id
    const phone = Number(phone_number)

    const user = await User.findById(userId)
    if (!user) {
      return sendResponse(res, 200, "Invalid User", null, 404, false)
    }

    const enquiry = new Enquiry({
      user_id: userId,
      name,
      email,
      phone_number:phone,
      comments
    })
    await enquiry.save()

    return sendResponse(res, 201, "Enquiry created succesfully", null, 200, true)

  } catch (error) {
    console.log("Error in sendEnquiry:", error);
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
}

export const getEnquiry = async (req,res)=>{
  try {
    const enquiries = await Enquiry.find({},{__v:0,updatedAt:0}).sort({ createdAt: -1 })
    if(enquiries && enquiries.length > 0){
      return sendResponse(res, 200, "Enquiry details fetched succesfully", enquiries, 200, true)
    }else{
       return sendResponse(res, 200, "No enquiry Available", [], 200, true)
    }
    
  } catch (error) {
    console.log("Error in getEnquiry:", error);
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
}
export const deleteEnquiry = async (req, res) => {
  try {
    const id = req.params.id
    const enquiry = await Enquiry.findByIdAndDelete(id)
    if (!enquiry) {
      return sendResponse(res, 200, "Invalid Enquiry", null, 404, false)
    }
    return sendResponse(res, 200, "Enquiry Deleted succesfully", null, 200, true)
  } catch (error) {
    console.log("Error in getEnquiry:", error);
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
}

export const addToCart = async (req, res) => {
  try {
    const user_id = req.user._id;
    const tour_id = req.params.id;

    if (!tour_id) {
      return sendResponse(res, 200, "Tour id is required", [], 400, false)
    }

    const tour = await Tour.findById(tour_id)
    if (!tour) {
      return sendResponse(res, 200, "Invalid Tour", [], 400, false)
    }


    const isAlreadyInCart = await Cart.findOne({ user_id, tour_id })
    if (isAlreadyInCart) {
      return sendResponse(res, 200, "Tour already in the cart", [], 400, false)
    }

    const cartInfo = new Cart({
      user_id,
      tour_id,
    })

    await cartInfo.save()

    return sendResponse(res, 200, "Tour added to the cart", [], 200, true)

  } catch (error) {
    console.log("Error in Add to cart:", error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
};

export const getUserCartList = async (req, res) => {
  try {
    const user_id = req.user._id;
    const objectId = mongoose.Types.ObjectId.createFromHexString(user_id)

    const cartDetails = await Cart.aggregate([
      {
        $match: { user_id: objectId }
      },
      {
        $lookup: {
          from: "tours",            
          localField: "tour_id",    
          foreignField: "_id",   
          as: "tourDetails"
        }
      },
      { $unwind: "$tourDetails" },
      {
        $project: {
          _id: 1,
          tour_id: "$tour_id",
          title: "$tourDetails.title",
          country: "$tourDetails.country",
          budget: "$tourDetails.budget",
          days: "$tourDetails.days"
        }
      }
    ])

    if (cartDetails.length > 0) {
      return sendResponse(res, 200, "Cart details fetched successfully", cartDetails, 200, true)
    } else {
      return sendResponse(res, 200, "No tours in the cart", [], 200, true)
    }
  } catch (error) {
    console.log("Error in getUserCartList:", error);
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const userId = req.user._id;


    const cartItem = await Cart.findById(cartId);
    if (!cartItem) {
      return sendResponse(res, 200, "Invalid Cart Id", [], 404, false)
    }


    if (cartItem.user_id.toString() !== userId.toString()) {
      return sendResponse(res, 200, "Unauthorized action", [], 403, false)
    }


    await Cart.findByIdAndDelete(cartId)

    return sendResponse(res, 200, "Removed from cart", [], 200, true)
  } catch (error) {
    console.log("Error in removeFromCart:", error);
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
};

export const getUserUpcomingBookings = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId.createFromHexString(req.user._id)

    const bookings = await Booking.aggregate([
      {
        $match: {
          user_id: userId,
          tour_status: "pending"
        }
      },
      {
        $lookup: {
          from: "tours",
          localField: "tour_id",
          foreignField: "_id",
          as: "tourDetails"
        }
      },
      { $unwind: "$tourDetails" },
      {
        $project: {
          _id: 1,
          tour_id: "$tourDetails._id",
          title: "$tourDetails.title",
          country: "$tourDetails.country",
          budget: "$tourDetails.budget",
          days: "$tourDetails.days",
          booking_status: 1,
          number_of_persons: 1,
          payment_status: 1,
          booking_date: 1
        }
      }
    ])

    if (bookings.length > 0) {
      return sendResponse(res,200,"Booking details fetched successfully",bookings,200,true)
    } else {
      return sendResponse(res, 200, "No booking details", [], 200, true)
    }
  } catch (error) {
    console.log("Error in getUserUpcomingBookings:", error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
};

export const getUserBookingHistory = async(req,res)=>{
  try {
     const userId = mongoose.Types.ObjectId.createFromHexString(req.user._id)
        const bookings = await Booking.aggregate([
      {
        $match: {
          user_id: userId,
          tour_status: "completed"
        }
      },
      {
        $lookup: {
          from: "tours",
          localField: "tour_id",
          foreignField: "_id",
          as: "tourDetails"
        }
      },
      { $unwind: "$tourDetails" },
      {
        $project: {
          _id: 1,
          tour_id: "$tourDetails._id",
          title: "$tourDetails.title",
          country: "$tourDetails.country",
          days: "$tourDetails.days",
          number_of_persons: 1,
          booking_date: 1
        }
      }
    ])

    if (bookings.length > 0) {
      return sendResponse(res,200,"Booking details fetched successfully",bookings,200,true)
    } else {
      return sendResponse(res, 200, "No booking details", [], 200, true)
    }
    
  } catch (error) {
     console.log("Error in getUserUpcomingBookings:", error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
    
  }
}








