const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const { authenticator,totp } = require('otplib');
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const {passwordUpdated} = require("../mail/PasswordUpdate");
require("dotenv").config();



// generate and send OTP
exports.sendOTP = async (req,res) => {
    try{
        // fetch email from request body
        const {email} = req.body;

        // check if user already exists or not
        const checkUserPresent = await User.findOne({email});

        // if user already exist
        if(checkUserPresent) {
            return res.status(409).json(
                {
                    success : false,
                    message : "User already registered"
                }
            );
        }

        // // generate otp
        // var otp = otpGenerator.generate(6,{
        //     upperCaseAlphabets : false,
        //     lowerCaseAlphabets : false,
        //     specialChars : false
        // });

        // console.log("OTP generated : ", otp);

        // // check unique otp or not
        // let result = await OTP.findOne({otp : otp});

        // while(result){
        //     otp = otpGenerator.generate(6,{
        //         upperCaseAlphabets : false,
        //         lowerCaseAlphabets : false,
        //         specialChars : false
        //     });

        //     result = await OTP.findOne({otp : otp});
        // }

        const secret = authenticator.generateSecret(); // base32 format
        console.log('Your secret:', secret);
        const otp = totp.generate(secret);
        console.log('TOTP:', otp);

        const otpPayload = {email,otp};

        // create an entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        return res.status(200).json(
            {
                success : true,
                message : "OTP Sent Successfully",
                otp
            }
        );
    }
    catch(error){
        console.log(error);
        return res.status(500).json(
            {
                success : false,
                message : "Error while generating OTP"
            }
        );
    }   
};


// signup function 
exports.signup = async (req,res) => {
    try{
        // fetch data
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;

        // validate data
        if(!firstName || !lastName || !password || !confirmPassword 
        || !otp || !email) {
            return res.status(403).json(
                {
                    success : false,
                    message : "All fields are required" 
                }
            );
        }

        // check contact number
        /*
        if(contactNumber.length !== 10){
            return res.status(400).json(
                {
                    success : false,
                    message : "Invalid Moblie Number"
                }
            );
        }*/

        // match passwords (password and confirm password)
        if(password !== confirmPassword) {
            return res.status(400).json(
                {
                    success : false,
                    message : "Password and Confirm Password are not matched"
                }
            );
        }

        // check user already exits
        const checkUserPresent = await User.findOne({email});
        if(checkUserPresent) {
            return res.status(401).json(
                {
                    success : false,
                    message : "User already registered"
                }
            );
        }

        // find most recently OTP stored for user
        const recentOtp = await OTP.find({email}).sort({createdAt : -1}).limit(1);
        console.log("Recent otp : ",recentOtp);

        // validate otp
        if(recentOtp.length === 0){
            return res.status(400).json(
                {
                    success : false,
                    message : "OTP Not Found"
                }
            );
        }
        else if(otp !== recentOtp[0].otp){
            return res.status(401).json(
                {
                    success : false,
                    message : "Invalid OTP"
                }
            );
        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password,10)

        // create entry in db
        const profileDetails = await Profile.create(
            {
                gender : null,
                dateOfBirth : null,
                about : null,
                contactNumber : null
            }
        );
        const user = await User.create(
            {
                firstName,
                lastName,
                email,
                password : hashedPassword,
                accountType,
                additionalDetails : profileDetails._id,
                image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`
            }
        );

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "User created successfully",
                user
            }
        );
    }
    catch(error){
        return res.status(401).json(
            {
                success : false,
                message : "Error in registration, Please try again"
            }
        );
    }
}



// login function
exports.login = async (req,res) => {
    try{
        // fetch the data from request
        const {email,password} = req.body;

        // validate data
        if(!email || !password) {
            return res.status(403).json(
                {
                    success : false,
                    message : "Please enter all the details" 
                }
            );
        }

        // check if user exits or not
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json(
                {
                    success : false,
                    message : "User does not exit" 
                }
            );
        }

        //  match password and genrate jwt token
        if(await bcrypt.compare(password,user.password)) {

            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType
            }

            // craeate jwt token
            let token = jwt.sign(payload,
                process.env.JWT_SECRET,
                {
                    expiresIn : "2h"
                }
            );

            const userData = user.toObject();
            userData.token = token;  // add to user data
            userData.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }

            return res.cookie("token",token,options).status(200).json(
                {
                    success : true,
                    token,
                    user : userData,
                    message : "User Logged in successfully"
                }
            );
        }
        else{
            // password do not match
            return res.status(403).json(
                {
                    success : false,
                    message : "Password is incorrect"
                }
            );
        }
    }
    catch(error){
        return res.status(401).json(
            {
                success : false,
                message : "Error while logging in, Please try again"
            }
        );
    }
}


// change password function
exports.changePassword = async (req,res) => {
    try{
        // get the data
        const userDetails = await User.findById(req.user.id);
        const {oldPassword,newPassword,newConfirmPassword} = req.body;

        // check valid data
        if(!newPassword || !newConfirmPassword || !oldPassword){
            return res.status(401).json(
                {
                    success : false,
                    message : "Please fill all the details"
                }
            );
        }

        // match user old passwords
        const isMatched = await bcrypt.compare(oldPassword,userDetails.password);
        if(!isMatched){
            return res.status(401).json(
                {
                    success : false,
                    message : "Your old password is incorrect"
                }
            );
        }

        // validation
        if(newPassword !== newConfirmPassword) {
            return res.status(401).json(
                {
                    success : false,
                    message : "New Password and New Confirm do not match"
                }
            );
        }

        // update password in db
        const hashedNewPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password : hashedNewPassword},
            {new : true}
        );

        // send email Password changed
        try{
            const response = await mailSender(updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );

            console.log("Email sent successfully : ",response);
        }
        catch(err){
            return res.status(400).json(
                
                {
                    success : false,
                    message : "Error in sending email",
                }
            );
        }

        // send response
        return res.status(200).json(
            {
                success : true,
                message : "Password is changed successfully"
                
            }
        );
    }
    catch(error){
        return res.status(400).json(
            {
                success : false,
                message : "Error while Changing Password"
            }
        );
    }
}

