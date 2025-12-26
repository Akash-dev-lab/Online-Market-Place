const express = require("express");
const router = express.Router();
const multer = require('multer');
const { createProduct, getProducts, getProductsById, updateProduct, deleteProduct, getSellerProducts} = require('../controllers/product.controller');
const createAuthMiddleware = require("../middlewares/auth.middleware");
const { productValidators } = require("../middlewares/valid.middleware");
const upload = multer({ storage: multer.memoryStorage() });


router.post("/", createAuthMiddleware(['admin', "seller"]), upload.array('images', 5), productValidators, createProduct)

router.get("/", getProducts)
router.put("/:id", createAuthMiddleware(["seller"]), upload.array('images', 5), updateProduct)
router.delete("/:id", createAuthMiddleware(["seller"]), deleteProduct)
router.get("/seller", createAuthMiddleware(["seller"]), getSellerProducts)
router.get("/:id", getProductsById)

module.exports = router;