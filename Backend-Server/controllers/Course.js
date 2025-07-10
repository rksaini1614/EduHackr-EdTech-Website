const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const {uploadFileToCloudinary} = require("../utils/fileUploader");
require("dotenv").config();



// create course
exports.createCourse = async (req,res) => {
    try{
        // get course data from request body
        const {courseName,description,status,learnings,price,category,tag} = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation of data
        if(!courseName || !description || !learnings || !price || !category || !thumbnail){
            return res.status(400).json(
                {
                    success : false,
                    message : "All fields are required"
                }
            );
        }

        if (!status || status === undefined) {
            status = "Draft";
        }

        // check for instructor
        // TODO :  verify that userId and instructorDetails._id are same or different
        const userId = req.user.id;
        const instructorDetails = await User.findById({_id : userId});
        console.log("Instructor details : ",instructorDetails);

        // if not instructor present
        if(!instructorDetails){
            return res.status(400).json(
                {
                    success : false,
                    message : "Instructor Details do not Found"
                }
            );
        }

        // check given tag is valid or not
        const categoryDetails = await Category.findById({_id : category});
        if(!categoryDetails){
            return res.status(400).json(
                {
                    success : false,
                    message : "Category Details do not Found"
                }
            );
        }

        // Upload image to cloudinary
        const thumbnailUImage = await uploadFileToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create an entry in db for new course
        const newCourse = await Course.create(
            {
                courseName,
                description,
                instructor : instructorDetails._id,
                learnings,
                price,
                tag,
                category : categoryDetails._id,
                thumbnail : thumbnailUImage.secure_url
            }
        );

        // add the new to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id : instructorDetails._id},
            {$push: {
                courses : newCourse._id
            }},
            {new : true}
        );

        // udate the category schema
        await Category.findByIdAndUpdate(
            {_id : categoryDetails._id},
            {$push: {
                courses : newCourse._id
            }},
            {new : true}
        );

        // send response
        return res.status(200).json(
            {
                success : true,
                message : "Course creates Successfully"
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Failed to create Course"
            }
        );
    }
}


// getall courses
exports.getAllCourses = async(req,res) => {
    try{
        const allCourses = await Course.find({},{
                                        courseName : true,
                                        description : true,
                                        learnings : true,
                                        price : true,
                                        thumbnail : true,
                                        category : true,
                                        instructor : true})
                                        .populate("instructor")
                                        .exec();
        return res.status(200).json(
            {
                success : true,
                message : "All Courses are fetched successfully",
                allCourses
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
};


// getCourseDetails
exports.getCourseDetails = async(req,res) => {
    try{
        // fetch course id
        const {courseId} = req.body;

        // validation
        if(!courseId){
            return res.status(400).json(
                {
                    success : false,
                    message : "Please enter the Course Id"
                }
            );
        }

        const courseDetails = await Course.findById({_id : courseId})
        .populate(
            {
                path : "instructor",
                populate : {
                    path : "additionalDetails"
                }
            }
        )
        .populate(
            {
                path : "courseContent",
                populate : {
                    path : "subSection"
                }
            }
        )
        .populate("ratingAndReviews")
        .populate("category")
        .populate("studentEnrolled")
        .exec();

        if(!courseDetails){
            return res.status(404).json(
                {
                    success : false,
                    message : "Course Not Found"
                }
            );
        }

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "Course Details fetch successfully",
                data : courseDetails
            }
        )
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Error while fetching details of Course"
            }
        );
    }
}