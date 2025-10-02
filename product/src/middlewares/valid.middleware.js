const { body, validationResult } = require('express-validator');

const respondWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error', errors });
    }
    next();
}


const productValidators = [
    body("title")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("title is required"),
    body("description")
        .optional()
        .isString()
        .withMessage("description must be a string")
        .trim()
        .isLength({ max: 500 })
        .withMessage("description max length is 500 characters"),
    body("priceAmount")
        .notEmpty()
        .withMessage("priceAmount is required")
        .isFloat({ gt: 0 })
        .withMessage("priceAmount must be a number > 0")
        .bail(),
    body("priceCurrency")
        .isString()
        .isIn(["USD", "INR"])
        .withMessage("priceCurrency is required")
        .notEmpty()
        .withMessage("priceCurrency must be USD or INR"),
    respondWithValidationErrors
]

module.exports = {
    productValidators
};