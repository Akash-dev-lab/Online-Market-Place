const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    country: String
})

const userSchema = new mongoose.Schema({
    username: {
        firstName: {type: String, required: true},
        lastName: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'admin'],
        default: 'seller'
    },
    addresses: [
        addressSchema
    ]
})

const sellerModel = mongoose.model('seller', userSchema)

module.exports = sellerModel