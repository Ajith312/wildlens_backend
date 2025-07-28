import mongoose from 'mongoose'

const tourSchema = new mongoose.Schema({
    tour_details: {
        title: { type: String, required: true },
        country: { type: String, required: true },
        description: String,
        image: String
    },
    plan_details: [
        {
            days: {
                type: Number,
                enum: [3, 5, 7],
                required: true
            },
            budget: {
                type: Number,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: String,
            inclusions: [{ type: String }],
            exclusions: [{ type: String }],
            imageGallery: [{ type: String }],
            placesCovered: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    description: String,
                    image: String
                }
            ]
        }
    ]
}, { timestamps: true })

const Tour = mongoose.model('Tour', tourSchema)

export default Tour
