const express = require("express");
const router = express.Router();
const { registerController, loginController, getCurrentUser, logoutUser, getUserAddresses, addUserAddresses } = require("../controllers/auth.controller");
const { registerUserValidations, loginUserValidations, addUserAddressesValidations } = require("../middlewares/valid.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");


router.post("/register", registerUserValidations, registerController)
router.post("/login", loginUserValidations, loginController)
router.get('/me', authMiddleware, getCurrentUser)
router.get('/logout', logoutUser)
router.get('/users/me/addresses', authMiddleware, getUserAddresses);
router.post('/users/me/addresses', authMiddleware, addUserAddressesValidations, addUserAddresses);

module.exports = router;