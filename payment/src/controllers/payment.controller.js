const PaymentModel = require("../models/payment.model")
const axios = require('axios')

async function createPayment(req, res) {

    const token = req.cookies?.token || req.headers?.authorization?.split(' ') [1]

    try {
        const orderId = req.params.orderId

        const orderResponse = await axios.get("http://localhost:3003/api/orders/" + orderId, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const price = orderResponse.data.data.totalPrice //yaha tak data aa raha hai jisme price mil rha hai
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

module.exports = {
    createPayment
}