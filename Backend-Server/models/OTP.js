const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/emailVerification");


// Define the OTP schema
const OTPSchema = new mongoose.Schema(
    {
        email  : {
            type : String,
            required : true,
            trim : true
        },
        createdAt : {
            type : Date,
            required : true,
            default : Date.now(),
            expires : 5 * 60
        },
        otp : {
            type : String,
            required : true
        }
    }
);


// function to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Email Verification",otpTemplate(otp));
        console.log("Email Send successfully : ",mailResponse);
    }
    catch(error){
        console.error("error occur while sending the mail");
        throw error;
    }
}

// pre middleware so that otp is send before the entry is made in db
OTPSchema.pre("save",async function(next){
    console.log("New document saved to database");

    // only send email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    
    next();
});


// Export the OTP Model
module.exports = mongoose.model("OTP",OTPSchema);