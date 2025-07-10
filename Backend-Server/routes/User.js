
const express = require("express");
const router = express.Router();


const {
    login,
    signup,
    sendOTP,
    changePassword
} = require("../controllers/Auth");

const {
    resetPasswordToken,
    resetPassword
} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");



// routes for login,signup and authenticatio

// login
router.post("/login",login);

// signup
router.post("/signup",signup);

// sendotp
router.post("/sendotp",sendOTP);

// change password
router.post("/changepassword",auth,changePassword);


// Routes for reset password

// generate reset password token
router.post("/reset-password-token",resetPasswordToken);

// resetting user's password after verification
router.post("/reset-password",resetPassword);


// export the router 
module.exports = router;