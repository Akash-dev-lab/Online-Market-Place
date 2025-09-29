const express = require("express");
const router = express.Router();
const { registerController } = require("../controllers/auth.controller");
const { registerUserValidations } = require("../middlewares/valid.middleware");


router.post("/register", registerUserValidations, registerController)

module.exports = router;