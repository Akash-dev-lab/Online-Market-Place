const { body, validationResult, param } = require('express-validator');
const mongoose = require('mongoose');

const respondWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error', errors });
    }
    next();
}


const validateAddItemToCart = [
    body("productId")
        .isString()
        .withMessage("Product ID must be a string")
        .withMessage("Invalid Product ID format")
         .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value.trim())) {
                throw new Error("Invalid Product ID format"); // must throw
            }
            return true;
        }),
    body("qty")
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer"),
    respondWithValidationErrors,
]

const validateUpdateCartItem = [
    param("productId")
        .isString()
        .withMessage("Product ID must be a string")
        .withMessage("Invalid Product ID format")
         .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value.trim())) {
                throw new Error("Invalid Product ID format"); // must throw
            }
            return true;
        }),
    body("qty")
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer"),
    respondWithValidationErrors,
]

module.exports = {
    validateAddItemToCart,
    validateUpdateCartItem
};