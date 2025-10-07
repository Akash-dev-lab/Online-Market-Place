const express = require('express')
const {createOrder, getMyOrders} = require('../controllers/order.controller')
const createAuthMiddleware = require('../middlewares/auth.middleware')
const addUserAddressesValidations = require('../middlewares/valid.middleware')

const router = express.Router()

router.post("/", createAuthMiddleware(["user"]), addUserAddressesValidations, createOrder)
router.get('/me', createAuthMiddleware(["user"]), getMyOrders)


module.exports = router