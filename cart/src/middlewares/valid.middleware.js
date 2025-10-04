const { body, validationResult } = require('express-validator');

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
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage("Invalid Product ID format"),
    body("qty")
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer"),
    respondWithValidationErrors,
]

module.exports = {
    validateAddItemToCart
};