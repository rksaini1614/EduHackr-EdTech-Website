
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


// generate link and send on email, reset the password

// resetPasswordToken
exports.resetPasswordToken = async (req,res) => {
    try{
        // get email from req for which password is to be reset
        const email = req.body.email;

        // check user for this email
        const user = await User.findOne({email : email});
        if(!user) {
            return res.status(401).json(
                {
                    success : false,
                    message : "User does not exist"              
                }
            );
        }

        // generate token
        const token = crypto.randomUUID();

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {email : email},
            {
                token : token,
                resetPasswordExpires : Date.now() + 5*60*1000
            },{new : true}
        );

        // create url
        const url = `https://localhost:3000/update-password/${token}`;

        // send eamil containig url
        await mailSender(email,"Password Reset Link",
            `<p>You can reset your password by clicking on the link below :</p>
            ${url}`
        )

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "Reset Link sent on email successfully"
            }
        );
    }
    catch(error){
        return res.status(400).json(
            {
                success : false,
                message : "Error while sending reset link on email"
            }
        );
    }
}


// resestPassword
exports.resetPassword = async (req,res) => {
    try{
        // data fetch
        const {password,confirmPassword,token} = req.body;

        // validation
        if(password !== confirmPassword) {
            return res.status(403).json(
                {
                    success : false,
                    message : "Passwords not matching"
                }
            ); 
        }

        // get userDetails from db using token
        const userDetails = await User.findOne({token : token});

        // if no - entry then invalid token
        if(!userDetails) {
            return res.status(403).json(
                {
                    success : false,
                    message : "Token is invalid"
                }
            );
        }

        // token time check
        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.status(403).json(
                {
                    success : false,
                    message : "Token is expired"
                }
            );
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password,10);

        // password update
        const updatedUser = await User.findOneAndUpdate({token : token},
            {password : hashedPassword},
            {new : true}
        );

        // send response
        return res.status(200).json(
            {
                success : true,
                message : "Password reset Successfully",
                data : updatedUser
            }
        );

    }
    catch(error){
        return res.status(400).json(
            {
                success : false,
                message : "Error while reseting the password"
            }
        );
    }
}
