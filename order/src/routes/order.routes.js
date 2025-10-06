const express = require('express')
const {createOrder} = require('../controllers/order.controller')
const createAuthMiddleware = require('../middlewares/auth.middleware')
const addUserAddressesValidations = require('../middlewares/valid.middleware')

const router = express.Router()

router.get("/", createAuthMiddleware(["user"]), addUserAddressesValidations, createOrder)


module.exports = router