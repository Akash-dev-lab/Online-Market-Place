const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    
    street: String,
    city: String,
    state: String,
    zip: String,
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
        enum: ['user', 'seller'],
        default: 'user'
    },
    addresses: [
        addressSchema
    ]
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel