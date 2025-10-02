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
        lastName: {type: String, required: true}
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
        default: 'user'
    },
    addresses: [
        addressSchema
    ]
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel