import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderItems: [
       {
        type: mongoose.Types.ObjectId,
        ref: 'OrderItem',
        required: true
       }
    ],
    shipingAddress1: {
        type: String,
        required: true
    },
    shipingAddress2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        required: true
    },
    totalPrice:{
        type: Number
    },
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Order', orderSchema);