const express = require('express');
const router = express.Router();
const createAuthMiddleware = require('../middlewares/auth.middleware');
const valid = require('../middlewares/valid.middleware')
const { addItemToCart, getCart, updateCartItem, deleteCartItem, clearCart } = require('../controllers/cart.controller');


router.get('/', createAuthMiddleware(['user']), getCart)
router.post('/items', createAuthMiddleware(['user']), valid.validateAddItemToCart, addItemToCart)
router.patch('/items/:productId', createAuthMiddleware(['user']), valid.validateUpdateCartItem, updateCartItem)
router.delete('/items/:productId', createAuthMiddleware(['user']), deleteCartItem)
router.delete('/', createAuthMiddleware(['user']), clearCart)

module.exports = router;