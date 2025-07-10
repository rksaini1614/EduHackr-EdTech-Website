
const {contactUsEmail} = require("../mail/contactFormRes");
const mailSender = require("../utils/mailSender");


exports.contactUsController = async(req,res) => {
    try{
        // find details
        const {email,firstName,lastName,message,phoneNo,countryCode} = req.body;
        console.log(req.body);

        const emailResponse = await mailSender(
            email,
            "Your Data send Successfully",
            contactUsEmail(email,firstName,lastName,message,phoneNo,countryCode)
        );
        console.log("email res : ",emailResponse);

        return res.status(200).json(
            {
                success : true,
                message : "Email send successfully"
            }
        );
    }
    catch(error){
        console.log("Error",error);
        console.log("Error Message : ",error.message);
        return res.status(500).json(
            {
                success : false,
                message : "Somehting went wrong..."
            }
        );
    }
}