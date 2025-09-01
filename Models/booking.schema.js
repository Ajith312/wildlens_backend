import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    tour_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tour',
        required:true
    },
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true

    },
    booking_date:{
        type:String,
        required:true
    },
    number_of_persons:{
        type:Number,
        default:1
    },
    guide_required:{
        type:Boolean,
        default:false
    },
    comments:{
        type:String
    },
    payment_status:{
        type:String,
        default:"pending"
    },
    booking_status:{
        type:String,
        default:"pending"
    },
    tour_status:{
        type:String,
        default:"pending"
    }


},{timestamps:true})

const Booking = mongoose.model('Booking',bookingSchema)
export default Booking