const { body, validationResult } = require('express-validator');

const respondWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}


const registerUserValidations = [
    body("firstName")
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),
    body("email")
        .isEmail()
        .withMessage("Invalid email address"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    body("lastName")
        .isString()
        .withMessage("Last name must be a string")
        .notEmpty()
        .withMessage("Last name is required"),
    body("role")
        .optional()
        .isIn([ 'user', 'seller' ])
        .withMessage("Role must be either 'user' or 'seller'"),
    respondWithValidationErrors
]

const loginUserValidations = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address'),
    body('username')
        .optional()
        .isString()
        .withMessage('Username must be a string'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ errors: [ { msg: 'Either email or username is required' } ] });
        }
        respondWithValidationErrors(req, res, next);
    }
]

const addUserAddressesValidations = [
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    body('street')
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street is required'),
    body('city')
        .isString()
        .withMessage('City must be a string')
        .notEmpty()
        .withMessage('City is required'),
    body('state')
        .isString()
        .withMessage('State must be a string')
        .notEmpty()
        .withMessage('State is required'),
    body('zip')
        .isString()
        .withMessage('Zip must be a string')
        .notEmpty()
        .withMessage('Zip is required'),
    body('phone')
        .isString()
        .withMessage('Phone must be a string')
        .notEmpty()
        .withMessage('Phone is required'),
    body('country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
    respondWithValidationErrors
]


module.exports = {
    registerUserValidations,
    loginUserValidations,
    addUserAddressesValidations
};