const express = require("express");
const router = express.Router();
const { registerController, loginController, getCurrentUser } = require("../controllers/auth.controller");
const { registerUserValidations, loginUserValidations } = require("../middlewares/valid.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");


router.post("/register", registerUserValidations, registerController)
router.post("/login", loginUserValidations, loginController)
router.get('/me', authMiddleware, getCurrentUser)

module.exports = router;