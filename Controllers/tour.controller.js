import Tour from "../Models/tour.schema.js";
import User from "../Models/user.schema.js";
import { sendResponse } from "../Utils/response.js";
import { validateTourPayload } from "../Utils/validateTourPayload.js";


export const createNewTour = async (req, res) => {
    try {
      const { tourId } = req.params
      const { tour_details, plan_details } = req.body
      if (Array.isArray(plan_details)) {
        return sendResponse(res, 400, 'Only one plan can be added at a time', null, 400, false)
      }
  
      if (tourId) {
        const existingTour = await Tour.findById(tourId)
  
        if (!existingTour) {
          return sendResponse(res, 404, 'Tour not found', null, 404, false)
        }
        const existingDays = existingTour.plan_details.map(plan => plan.days)
        if (existingDays.includes(plan_details.days)) {
          return sendResponse(res, 208, 'Plan for the given days already exists', null, 208, false)
        }
        const { isValid, message } = validateTourPayload(null, [plan_details])
        if (!isValid) {
          return sendResponse(res, 400, message, null, 400, false)
        }
  
        existingTour.plan_details.push(plan_details)
        await existingTour.save()
  
        return sendResponse(res, 201, 'New plan added to existing tour', existingTour, 201, true)
      }
  
      const { isValid, message } = validateTourPayload(tour_details, [plan_details])
      if (!isValid) {
        return sendResponse(res, 400, message, null, 400, false)
      }
  
      const existingTour = await Tour.findOne({ 'tour_details.country': tour_details.country })
      if (existingTour) {
        return sendResponse(
          res,
          409,
          'Tour for this country already exists. Provide tourId to add a plan',
          null,
          409,
          false
        )
      }
  
      const newTour = new Tour({
        tour_details,
        plan_details: [plan_details]
      })
  
      await newTour.save()
      return sendResponse(res, 201, 'Tour created successfully', newTour, 201, true)
  
    } catch (error) {
      console.error('createNewTour error:', error)
      return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
    }
  }

export const editTourPlan = async (req, res) => {
    try {
      const { planId } = req.params
      const { plan_details } = req.body
  
      if (!planId || !plan_details) {
        return sendResponse(res, 400, 'planId and plan_details are required', null, 400, false)
      }
      const { isValid, message } = validateTourPayload(null, [plan_details])
      if (!isValid) {
        return sendResponse(res, 400, message, null, 400, false)
      }
      const tour = await Tour.findOne({ 'plan_details._id': planId })
      if (!tour) {
        return sendResponse(res, 404, 'Tour containing the plan not found', null, 404, false)
      }
  
      const plan = tour.plan_details.id(planId)
      if (!plan) {
        return sendResponse(res, 404, 'Plan not found in tour', null, 404, false)
      }
      plan.set(plan_details)
  
      await tour.save()
  
      return sendResponse(res, 200, 'Plan updated successfully', plan, 200, true)
  
    } catch (error) {
      console.error('editTourPlan error:', error)
      return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
    }
  }
export const deleteTourPlan = async (req, res) => {
    try {
      const { planId } = req.params
  
      if (!planId) {
        return sendResponse(res, 400, 'planId is required', null, 400, false)
      }
  
      const tour = await Tour.findOne({ 'plan_details._id': planId })
  
      if (!tour) {
        return sendResponse(res, 404, 'Tour containing the plan not found', null, 404, false)
      }

      const plan = tour.plan_details.id(planId)
      if (!plan) {
        return sendResponse(res, 404, 'Plan not found in tour', null, 404, false)
      }
      tour.plan_details.pull({ _id: planId })
      await tour.save()
      return sendResponse(res, 200, 'Plan deleted successfully', null, 200, true)
  
    } catch (error) {
      console.error('deleteTourPlan error:', error)
      return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
    }
  }
export const getAllTours = async (req,res)=>{
    try {
        const tours = await Tour.find()
        return sendResponse(res, 200, 'Tour Details send successfully', tours, 200, true) 
        
    } catch (error) {
    console.error('getAllTours error:', error)
    return sendResponse(res, 500, 'Internal Server Error', null, 500, false)
        
    }
}
  
  
  
  