const express = require("express");
const router = express.Router()
const userController = require("../controller/userController");

// register 
router.post("/userRegister", userController.userRegister);
// login
router.post("/userLogin", userController.Login);

// forget password
router.post("/forgetPassword", userController.forgetPassword);

// reset password
router.get("/reset_Password", userController.reset_Password);


module.exports =router;