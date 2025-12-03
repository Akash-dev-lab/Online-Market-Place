const express = require('express');
const multer = require('multer');
const createAuthMiddleware = require('../middlewares/auth.middleware');
const { getSellerMetrics, getOrders, getProducts, createProduct, updateProduct } = require('../controllers/seller.controller');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/metrics', createAuthMiddleware(['seller']), getSellerMetrics);
router.get('/orders', createAuthMiddleware(['seller']), getOrders);
router.get('/products', createAuthMiddleware(['seller']), getProducts);

router.post("/products/create", createAuthMiddleware(["seller"]), upload.array("images", 5), createProduct);
router.put("/products/update/:id", createAuthMiddleware(["seller"]), upload.array("images", 5), updateProduct);


module.exports = router;