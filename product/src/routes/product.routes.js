const express = require("express");
const router = express.Router();
const multer = require('multer');
const { createProduct, getProducts, getProductsById, updateProduct} = require('../controllers/product.controller');
const createAuthMiddleware = require("../middlewares/auth.middleware");
const { productValidators } = require("../middlewares/valid.middleware");
const upload = multer({ storage: multer.memoryStorage() });


router.post("/", createAuthMiddleware(['admin', "seller"]), upload.array('images', 5), productValidators, createProduct)

router.get("/", getProducts)
router.get("/:id", getProductsById)
router.patch("/:id", createAuthMiddleware(['admin', "seller"]), upload.array('images', 5), updateProduct)

module.exports = router;