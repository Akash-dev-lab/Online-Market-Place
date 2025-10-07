const express = require('express')
const {createOrder, getMyOrders, getOrderById, cancelOrderController, updateOrderAddress} = require('../controllers/order.controller')
const createAuthMiddleware = require('../middlewares/auth.middleware')
const addUserAddressesValidations = require('../middlewares/valid.middleware')

const router = express.Router()

router.post("/", createAuthMiddleware(["user"]), addUserAddressesValidations, createOrder)
router.get('/me', createAuthMiddleware(["user"]), getMyOrders)
router.get("/:id", createAuthMiddleware(["user"]), getOrderById);
router.post('/:id/cancel', createAuthMiddleware(["user"]), cancelOrderController)
router.patch('/:id/address', createAuthMiddleware(["user"]), updateOrderAddress)


module.exports = router