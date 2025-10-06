const { body, validationResult } = require('express-validator');

const respondWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

const addUserAddressesValidations = [
    body('shippingAddress.name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    body('shippingAddress.street')
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street is required'),
    body('shippingAddress.city')
        .isString()
        .withMessage('City must be a string')
        .notEmpty()
        .withMessage('City is required'),
    body('shippingAddress.state')
        .isString()
        .withMessage('State must be a string')
        .notEmpty()
        .withMessage('State is required'),
    body('shippingAddress.zip')
        .isString()
        .withMessage('Zip must be a string')
        .notEmpty()
        .withMessage('Zip is required'),
    body('shippingAddress.phone')
        .isString()
        .withMessage('Phone must be a string')
        .notEmpty()
        .withMessage('Phone is required'),
    body('shippingAddress.country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
    respondWithValidationErrors
]


module.exports = addUserAddressesValidations