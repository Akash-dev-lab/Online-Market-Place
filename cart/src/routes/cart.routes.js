const express = require('express');
const router = express.Router();
const createAuthMiddleware = require('../middlewares/auth.middleware');
const {validateAddItemToCart, validateUpdateCartItem} = require('../middlewares/valid.middleware')
const { addItemToCart, getCart, updateCartItem } = require('../controllers/cart.controller');


router.get('/', createAuthMiddleware(['user']), getCart)
router.post('/items', validateAddItemToCart, createAuthMiddleware(['user']), addItemToCart)
router.patch('/items/:productId', validateUpdateCartItem, createAuthMiddleware(['user']), updateCartItem)


module.exports = router;