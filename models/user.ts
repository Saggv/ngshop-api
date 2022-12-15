import mongoose from 'mongoose';


const citySchema = new mongoose.Schema({
    province_id: String,
    province_name: String,
    province_type: String,
});

const districtSchema = new mongoose.Schema({
    district_id: String,
    district_name: String,
    district_type: String,
    province_id: String,
    lat: String,
    lng: String
})


const wardSchema = new mongoose.Schema({
    district_id: String,
    ward_id: String,
    ward_name: String,
    ward_type: String,
})


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    ward: {
        type: wardSchema
    },
    district: {
        type: districtSchema
    },
    city: {
        type: citySchema
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    role: {
        type: String,
        required: true
    },
});

export default mongoose.model('User', userSchema);