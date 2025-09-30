const express = require("express");
const router = express.Router();
const { registerController, loginController } = require("../controllers/auth.controller");
const { registerUserValidations, loginUserValidations } = require("../middlewares/valid.middleware");


router.post("/register", registerUserValidations, registerController)
router.post("/login", loginUserValidations, loginController)

module.exports = router;