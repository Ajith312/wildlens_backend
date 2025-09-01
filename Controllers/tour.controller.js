import Tour from "../Models/tour.schema.js";
import User from "../Models/user.schema.js";
import Booking from "../Models/booking.schema.js";
import { sendResponse } from "../Utils/response.js";
import { validateTourPayload } from "../Utils/validateTourPayload.js";
import { toTitleCase } from "../Utils/stringFunction.js";
import Enquiry from "../Models/enquiry.schema.js";
import Cart from "../Models/cart.schema.js";
import mongoose from "mongoose";


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

    await Tour.findByIdAndDelete(tourId);
    return sendResponse(res, 200, 'Tour deleted successfully', null, 200, true)

  } catch (error) {
    console.error('deleteTourPlan error:', error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
  }
}
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({},
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

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    if (!bookingId) {
      return sendResponse(res, 200, "Booking id is missing", [], 400, false)
    }


    const booking = await Booking.findOne({ _id: bookingId, user_id: userId })
    if (!booking) {
      return sendResponse(res, 200, "Invalid user or booking not found", [], 404, false)
    }


    booking.booking_status = "cancelled"
    booking.tour_status = "cancelled"
    await booking.save()

    return sendResponse(res, 200, "Booking cancelled successfully", booking, 200, true)

  } catch (error) {
    console.log("Error in cancelBooking:", error)
    return sendResponse(res, 500, "Internal Server Error", null, 500, false)
  }
};


export const getAllBookings = async (req, res) => {
  try {

    const bookings = await Booking.aggregate([{
      $lookup: {
        from: "tours",
        localField: "tour_id",
        foreignField: "_id",
        as: "Tour_Details"
      }
    },
    {
      $unwind: "$Tour_Details"
    },
    {
      $project: {
        first_name: 1,
        last_name: 1,
        booking_date: 1,
        booking_status: 1,
        payment_status: 1,
        title: "$Tour_Details.title",
        country: "$Tour_Details.country",
        budget: "$Tour_Details.budget",
        plan_title:"$Tour_Details.plan_title"
      }
    }
    ])

    console.log(bookings ,'bookings')

    return sendResponse(res,200,"Booking details fetched succesfully",bookings,200,true)
  } catch (error) {
    console.log(error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)

  }
}


export const uploadTourGallery = async (req, res) => {
  try {
    const { tourId } = req.params
    if (!req.files || req.files.length === 0) {
      return sendResponse(res, 200, "Please upload at least one image",null,400,false)
    }
    const tourExists = await Tour.findById({ _id: tourId })
    if (!tourExists) {
      return sendResponse(res, 200, "Tour not found",null,404,false)
    }

    const uploadPromises = req.files.map(file => {
      const b64 = Buffer.from(file.buffer).toString("base64")
      const dataURI = "data:" + file.mimetype + ";base64," + b64
      
      return cloudinary.uploader.upload(dataURI, {
        folder: `tours/${tourId}/gallery`,
        transformation: [
          { width: 1600, height: 900, crop: "fill", quality: "auto" }
        ]
      })
    })

    const uploadResults = await Promise.all(uploadPromises)
    const imageUrls = uploadResults.map(result => result.secure_url)

    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      { $push: { image_gallery: { $each: imageUrls } } },
      { new: true, runValidators: true }
    )

    return sendResponse(res,200,`${imageUrls.length} images added to gallery`,
      {gallery: updatedTour.image_gallery,
      total_images: updatedTour.image_gallery.length},true)
    
  } catch (error) {
    console.error("Gallery upload error:", error)
    if (uploadResults) {
      await Promise.all(uploadResults.map(result => 
        cloudinary.uploader.destroy(result.public_id).catch(e => console.error(e))
      ))
    }
    return sendResponse(res,500, error.message || "Failed to upload gallery images")
  }
};


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








