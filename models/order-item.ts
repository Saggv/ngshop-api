import mongoose from "mongoose";

const orderItem = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product:{
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    }
})

export default mongoose.model('OrderItem', orderItem);