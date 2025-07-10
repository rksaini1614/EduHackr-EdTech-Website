const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();



// auth handler
exports.auth = async (req,res,next) => {
    try{
        // get data from jwt token
        const token = 
  req.cookies.token ||
  req.body.token ||
  req.header("Authorization")?.replace("Bearer ", "").trim();

        // if token is missing, then return response
        if(!token) {
            return res.status(401).json(
                {
                    success : false,
                    message : "Token is missing"
                }
            );
        }

        // verify the token 
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(err){
            return res.status(401).json(
                {
                    success : false,
                    message : "Token is invalid"
                }
            );
        }
        next();
    }
    catch(error){
        return res.json(
            {
                success : false,
                message : error.message
            }
        );
    }
}


// isStudent
exports.isStudent = async (req,res,next) => {
    try{
        const userDetails = await User.findOne({email : req.user.email});

        if(userDetails.accountType !== "Student"){
            return res.status(401).json(
                {
                    success : false,
                    message : "This is protected route for Student only"
                }
            );
        }
        next();
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "User type cannot be verified, Please try again"
            }
        );
    }
}


// isInstructor
exports.isInstructor = async (req,res,next) => {
    try{
        const userDetails = await User.findOne({email : req.user.email});
        
        if(userDetails.accountType !== "Instructor"){
            return res.json(
                {
                    success : false,
                    message : "This is protected route for Instructor only"
                }
            );
        }
        next();
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "User type cannot be verified, Please try again"
            }
        );
    }
}


// isAdmin
exports.isAdmin = async (req,res,next) => {
    try{
        const userDetails = await User.findOne({email : req.user.email});

        if(userDetails.accountType !== "Admin"){
            return res.status(401).json(
                {
                    success : false,
                    message : "This is protected route for Admin only"
                }
            );
        }
        next();
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "User type cannot be verified, Please try again"
            }
        );
    }
}

