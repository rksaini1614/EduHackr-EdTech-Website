const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadFileToCloudinary } = require("../utils/fileUploader");
require("dotenv").config();

// create/update profilev :- profile already created with null values
exports.updateProfile = async(req,res) => {
    try{
        // get the data and userId
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;
        const userId = req.user.id;

        // validation
        if(!contactNumber || !gender || !userId){
            return res.status(400).json(
                {
                    success : false,
                    message : "All fields are required"
                }
            );
        }

        // find profile
        const userDetails = await User.findById({_id : userId});
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById({_id : profileId});

        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        const updatedProfile = await profileDetails.save();

        // return response
        return res.status(200).json( 
            {
                    
                success : true,
                message : "Profile Updated Successfully",
                data : updatedProfile
            }
        );
    }
    catch(error){
        return res.status(400).json(
                {
                    success : false,
                    message : "Failed to Update Profile"
                }
        );
    }
}

// delete account
// how can we schedule delete account
exports.deleteAccount = async(req,res) => {
    try{
        // get the id
        const userId = req.user.id;

        // validation
        const user = await User.findById({_id : userId});
        if(!user){
            return res.status(404).json(
                {
                    success : false,
                    message : "User Not Found"
                }
            );
        }

        // delete profile
        await Profile.findByIdAndDelete({_id : user.additionalDetails});

        // TODO :- unenroll user from all courses
        for (const courseId of user.courses){
            await Course.findByIdAndUpdate(
                {courseId},
                {$pull :{
                    studentEnrolled : userId
                }},
                {new : true}
            );
        }

        // delete user
        await User.findByIdAndDelete({_id : userId});

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "Account Deleted Successfully"
            }
        );
    }
    catch(error){
         return res.status(400).json(
            {
                success : false,
                message : "Failed to Delete Account"
            }
        );
    }
}


// get all users details
exports.getAllUserDetails = async (req,res) =>{
    try{
        // get user id
        const userId = req.user.id;

        // validate the user
        if(!userId) {
            return res.status(400).json(
                {
                    success : false,
                    message : "All fields are required"
                }
            );
        }

        const user = await User.findById({_id : userId})
        .populate("additionalDetails").exec();

        console.log("User : ",user);

        // if user does not exists
        if(!user){
            return res.status(404).json(
                {
                    success : false,
                    message : "User Not Found"
                }
            );
        }

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "User details fetched successfully",
                data : user
            }
        );  
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Failed to Fetch User Details"
            }
        );
    }
}


// update display picture
exports.updateDisplayPicture = async(req,res) => {
    try{

        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        const image = await uploadFileToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        console.log("image : ",image);

        const updatedProfile = await User.findByIdAndUpdate(
            {_id : userId},
            {image : image.secure_url},
            {new : true}
        );

        return res.json(
            {
                success : true,
                message : "Image updated successfully",
                data : updatedProfile
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : error.message
            }
        );
    }
}


// get all enrolled courses
exports.getEnrolledCourses = async(req,res) => {
    try{
        const userId = req.user.id;
        let userDetails = await User.findOne(
            {id:userId}
        )
        .populate(
            {
                path : "courses",
                populate : {
                    path : "courseContent",
                    populate : {
                        path : "subSection"
                    }
                }
            }
        )
        .exec();

        userDetails = userDetails.toObject();
        var SubsectionLength = 0;
        for(var i =0;i<userDetails.courses.length; i++) {
            let totalDuration = 0;
            SubsectionLength = 0;
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                totalDurationInSeconds
                )
                SubsectionLength +=
                userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage =
                Math.round(
                    (courseProgressCount / SubsectionLength) * 100 * multiplier
                ) / multiplier
            }
        }

        if (!userDetails) {
            return res.status(400).json(
                {
                    success: false,
                    message: `Could not find user with id: ${userDetails}`,
                }   
            )
        }
        return res.status(200).json(
            {
                success: true,
                data: userDetails.courses,
            }
        )

    }
    catch(error){
        return res.status(500).json({
        success: false,
        message: error.message,
        })
    }
}


exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

