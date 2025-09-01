import mongoose from 'mongoose'

const tourSchema = new mongoose.Schema({
        title: { 
             type: String,
             required: true 
            },
        country: { 
            type: String, 
            required: true 
        },
        description: String,
        days: {
                type: Number,
                enum: [3, 5, 7],
                required: true
            },
        budget: {
                type: Number,
                required: true
            },
        plan_title: {
                type: String,
                required: true
            },
        plan_description: String,
        inclusions: [{ type: String }],
        exclusions: [{ type: String }],
        image_gallery: [{ type: String }],
        places_covered: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    description: String,
                }
            ]
  
}, { timestamps: true })

const Tour = mongoose.model('Tour', tourSchema)

export default Tour
