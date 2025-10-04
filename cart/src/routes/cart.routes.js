const express = require('express');
const router = express.Router();
const createAuthMiddleware = require('../middlewares/auth.middleware');
const {validateAddItemToCart} = require('../middlewares/valid.middleware')
const { addItemToCart } = require('../controllers/cart.controller');


// router.get('/')
router.post('/items', validateAddItemToCart, createAuthMiddleware(['user']), addItemToCart)


module.exports = router;