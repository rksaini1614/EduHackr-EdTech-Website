const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/courseEnrollmentEmail");
const {paymentSuccessEmail} = require("../mail/paymentSuccessfullEmail");
const mongoose = require("mongoose");
require("dotenv").config();
const CourseProgress = require("../models/CourseProgress");


// capture payment
exports.capturePayment = async(req,res) =>{
    
    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.json(
            {
                success : false,
                message : "Please provide Course Id"
            }
        );
    }

    let totalAmount = 0;
    for(const courseId of courses){
        let course;
        try{
            course = await Course.findById(courseId);
            if(!course){
                return res.status(404).json(
                    {
                        success : false,
                        message : "Could not find the course"
                    }
                );
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentEnrolled.includes(uid)){
                return res.status(200).json(
                    {
                        success : false,
                        message : "Student is already enrolled"
                    }
                );
            }

            totalAmount += course.price;
        }
        catch(error){
            console.log(error);
            return res.status(500).json(
                {
                    success : false,
                    message : error.message
                }
            );
        }
    }

    const options = {
        amount : totalAmount*100,
        currency : "INR",
        receipt : Math.random(Date.now()).toString(),
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        return res.status(200).json(
            {
                success : true,
                message : "Payment response create successfully",
                data : paymentResponse
            }
        );
    }
    catch(error){
        console.log(error);
        return res.status(500).json(
            {
                success:false,
                message : error.message
            }
        );
    }
}


// payement verification
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses

    const userId = req.user.id

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
    ) {
        return res.status(200).json(
            { 
                success: false, message: "Payment Failed" 
            }
        )
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex")

    if (expectedSignature === razorpay_signature) {
        await enrollStudents(courses, userId, res)
        return res.status(200).json(
            { 
                success: true, 
                message: "Payment Verified" 
            }
        )
    }

    return res.status(200).json(
        { success: false, 
            message: "Payment Failed" 
        }
    )
}



// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json(
            {
                 success: false, 
                message: "Please Provide Course ID and User ID" 
            }
        )
    }

    for (const courseId of courses) {
        try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            { _id: courseId },
            { $push: { studentsEnroled: userId } },
            { new: true }
        )

        if (!enrolledCourse) {
            return res.status(500).json(
                { 
                    success: false, 
                    error: "Course not found" 
                }
            )
        }
        console.log("Updated course: ", enrolledCourse)

        const courseProgress = await CourseProgress.create({
            courseID: courseId,
            userId: userId,
            completedVideos: [],
        })
        // Find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
            userId,
            {
            $push: {
                courses: courseId,
                courseProgress: courseProgress._id,
            },
            },
            { new: true }
        )

        console.log("Enrolled student: ", enrolledStudent)
        // Send an email notification to the enrolled student
        const emailResponse = await mailSender(
            enrolledStudent.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
            )
        )

        console.log("Email sent successfully: ", emailResponse.response)
        } 
        catch (error) {
            console.log(error)
            return res.status(400).json(
                { 
                    success: false, 
                    error: error.message 
                }
            )
        }
    }
}



// send payment successfull email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}











// // capture the payment and initiate the razorpay order
// exports.capturePayment = async(req,res) => {
//     try{
//         // get course id and user id
//         const {courseId} = req.body;
//         const userId = req.user.id;

//         // validation
//         // valid course id
//         if(!courseId) {
//             return res.status(401).json(
//                 {
//                     success : false,
//                     message : "Please provide valid course Id"
//                 }
//             );
//         }

//         // vlaid courseDetails
//         let course = await Course.find({courseId});
//         if(!course){
//             return res.status(404).json(
//                 {
//                     success : false,
//                     message : "Cousre Not Found"
//                 }
//             );
//         }

//         // user already pay for same course or not
//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentEnrolled.includes(uid)){
//             return res.status(200).json(
//                 {
//                     success : true,
//                     message : "Student is already Enrolled"
//                 }
//             );
//         }

//         // order creation 
//         const amount = course.price;
//         const currency = "INR";

//         const options = {
//             amount : amount*100,
//             currency,
//             receipt : Math.random(Date.now()).toString(),
//             notes : {
//                 courseId,
//                 userId
//             }
//         }

//         try{
//             // initialize the payment using razorpay
//             const paymentResponse = await instance.orders.create(options);
//             console.log(paymentResponse);
//         }
//         catch(error){
//             return res.status(500).json(
//                 {
//                     success : false,
//                     message : "Error while creating the Order"
//                 }
//             );
//         }

//         // return response
//         return res.status(200).json(
//             {
//                 success : true,
//                 coursename : course.cousreName,
//                 courseDescritption : course.description,
//                 thumbnail : cousre.thumbnail,
//                 orderId : paymentResponse.id,
//                 currency : paymentResponse.currency,
//                 amount : paymentResponse.amount,
//                 message : "Student is registered Successfully"
//             }
//         )
//     }
//     catch(error){
//         return res.status(500).json(
//             {
//                 success : false,
//                 message : "Error while capturing the payment"
//             }
//         );
//     }
// }



// // authorization of the payment
// exports.verifySignuature = async(req,res) => {
//     try{
//         const webhookSecret = "12345678";
//         const signature = req.headers["x-razorpay-signature"];

//         const shasum = crypto.createHmac("sha256",webhookSecret);
        
//         shasum.udate(JSON.stringify(req.body));
//         const digest = shasum.digest("hex");

//         if(signature === digest){
//             console.log("Payment is Authorized");

//             // enroll the student in course 
//             // add course in user and add user in course
//             const {courseId,userId} = req.body.payload.payment.entity.notes;

//             try{
//                 // fulfil the action

//                 // find the course and enroll the student in it
//                 const enrolledCourse = await Course.findOneAndUpdate(
//                     {_id : courseId},
//                     {$push : {
//                         studentEnrolled : userId
//                     }},
//                     {new : true}
//                 );

//                 if(!enrolledCourse){
//                     return res.status(500).json(
//                         {
//                             success : false,
//                             message : "Course Not Found"
//                         }
//                     );
//                 }
//                 console.log(enrolledCourse);

//                 // add the course in user 
//                 const enrolledStudent = await User.findOneAndUpdate(
//                     {_id : courseId},
//                     {$push : {
//                         courses : courseId
//                     }},
//                     {new : true}
//                 );

//                 if(!enrolledStudent){
//                     return res.status(500).json(
//                         {
//                             success : false,
//                             message : "Student Not Found"
//                         }
//                     );
//                 }
//                 console.log(enrolledStudent);

//                 // mail send :- confirmation mail
//                 const emailResponse = await mailSender(
//                     enrolledStudent.email,
//                     `Successfully Enrolled into ${enrolledCourse.courseName}`,
//                     courseEnrollmentEmail(
//                     enrolledCourse.courseName,
//                     `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
//                     )
//                 );

//                 console.log("Email send successfully : ",emailResponse);

//             }
//             catch(err){
//                 return res.status(500).json(
//                     {
//                         success : false,
//                         message : "Error while fulfil action"
//                     }
//                 );
//             }  
//         }
//         else{
//             return res.status(400).json(
//                 {
//                     success : false,
//                     mesaage : "Signature is not matched"
//                 }
//             );
//         }
//     }
//     catch(error){
//         return res.status(500).json(
//             {
//                 success : false,
//                 message : "Error while veryfing Signature"
//             }
//         );
//     }
// }


