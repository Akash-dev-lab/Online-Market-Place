const express = require('express')
const createAuthMiddleware = require("../middlewares/auth.middleware")
const {createPayment} = require("../controllers/payment.controller")
const router = express.Router()

router.post('/create/:orderId', createAuthMiddleware(["user"]), createPayment)

module.exports = router