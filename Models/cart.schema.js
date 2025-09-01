import mongoose from "mongoose"


const cartSchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        requiired:true
    },
    tour_id:{
        type:mongoose.Schema.Types.ObjectId,
        requiired:true
    }
})

const Cart = mongoose.model("cart",cartSchema)

export default Cart