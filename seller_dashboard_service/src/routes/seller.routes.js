const express = require('express');
const multer = require('multer');
const createAuthMiddleware = require('../middlewares/auth.middleware');
const { getSellerMetrics, getOrders, getProducts, createProduct, updateProduct, deleteProduct, getSellerProducts, getProductsById } = require('../controllers/seller.controller');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/metrics', createAuthMiddleware(['seller']), getSellerMetrics);
router.get('/orders', createAuthMiddleware(['seller']), getOrders);
router.get('/products', createAuthMiddleware(['seller']), getProducts);

router.post("/products/create", createAuthMiddleware(["seller"]), upload.array("images", 5), createProduct);
router.put("/products/update/:id", createAuthMiddleware(["seller"]), upload.array("images", 5), updateProduct);
router.delete("/products/delete/:id", createAuthMiddleware(["seller"]), deleteProduct);
router.get("/seller/products", createAuthMiddleware(["seller"]), getSellerProducts);
router.get("/products/:id", getProductsById);



module.exports = router;