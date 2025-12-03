const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, },
    price: {
        amount: {
            type: Number, required: true
        },
        currency: {
            type: String,
            enum: ['USD', 'INR'],
            default: 'INR'
        }
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    Images: [{
        url: String,
        thumbnail: String,
        id: String
    }],
    stock: {
        type: Number,
        default: 0
    }
})


module.exports = mongoose.model("product", productSchema);