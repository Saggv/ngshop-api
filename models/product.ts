import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    productDetail:{
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
        required: true
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        default: 0,
        max: 225
    },
    rating: {
        type: Number,
        default: 0,
        max: 225
    },
    numReviews: {
        type: Number,
        default: 0,
        max: 225
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

productSchema.virtual('id').get(function(){
    return this._id.toHexString();
})

productSchema.set('toJSON', {
    virtuals: true
})

export default mongoose.model('Product', productSchema);