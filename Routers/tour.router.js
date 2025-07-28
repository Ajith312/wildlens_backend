import express from 'express'
import { createNewTour, deleteTourPlan, editTourPlan, getAllTours } from '../Controllers/tour.controller.js'

const router = express.Router()

router.post('/create_tour', createNewTour)
router.post('/create_tour/:tourId', createNewTour)
router.patch('/edit_plan/:planId',editTourPlan)
router.delete('/delete_plan/:planId', deleteTourPlan)
router.get('/get_all_tours',getAllTours)




export default router