const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");



// create rating and review handler
exports.createReviewAndRating = async(req,res) => {
    try{
        // get user id
        const userId = req.user.id;

        // fetch data from body
        const {rating,review,courseId} = req.body;

        // validation
        if(!userId || !rating || !review || !courseId){
            return res.status(400).json(
                {
                    success : false,
                    message : "Please fill all the details"
                }
            );
        }

        // check if user is enrolled or not
        const courseDetails = await Course.findById(
            {
                _id : courseId,
                studentEnrolled : {$eleMatch : {$eq: userId}}
            }
        );

        if(!courseDetails){
            return res.status(404).json(
                {
                    success : false,
                    message : "Student is not enrolled in course"
                }
            );
        }
        
        // if(!course.studentEnrolled.includes(userId)){
        //     return res.status(404).json(
        //         {
        //             success : false,
        //             message : "Student is not enrolled in course"
        //         }
        //     );
        // }

        // if user has given review already or not
        const alreadyReviewed = await RatingAndReview.findOne(
            {
                user : userId,
                course : courseId
            }
        );

        if(alreadyReviewed){
            return res.status(403).json(
                {
                    success : false,
                    message : "User has already reviewed the course"
                }
            );
        }

        // create review and rating
        const ratingReview = await RatingAndReview.create(
            {
                rating,
                review,
                course : courseId,
                user : userId
            }
        );

        // attach with course
        const updatedCourse = await Course.findByIdAndUpdate(
            {_id : courseId},
            {
                $push : {
                    ratingAndReviews : ratingReview._id
                }
            },
            {new : true}
        );
        console.log("Updated Course : ",updatedCourse);

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "Rating and Review created Successfully"
            }
        )
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Error while creating Review and Rating"
            }
        );
    }
}


// find the average rating
exports.findAverageRating = async(req,res) => {
    try {
        // get course id 
        const courseId = req.body.courseId;

        // calculate average rating
        const result = await RatingAndReview.aggregate(
            [
                {
                    $match : {
                        course : new mongoose.Types.ObjectId(courseId)
                    }
                },
                {
                    $group : {
                        _id : null,
                        averageRating : {$avg : "$rating"}
                    }
                }
            ]
        );

        // if rating exists
        if(result.length > 0){
            return res.status(200).json(
                {
                    success : true,
                    averageRating : result[0].averageRating
                }
            );
        }

        // if not existing
        return res.status(200).json(
            {
                success : true,
                message : "Average rating is 0, no rating given till now",
                averageRating : 0
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Error while calculating average rating"
            }
        );
    }
}


// getAllRatingandReview
exports.getAllRating = async(req,res) => {
    try{
        // get all review 
        const allReviews = await RatingAndReview.find({})
                                    .sort({rating : "desc"})
                                    .populate(
                                        {
                                            path : "user",
                                            select : "firstName lastName email image"
                                        }
                                    )
                                    .populate({
                                        path : "course",
                                        select : "courseName"
                                    }).exec();

        if(!allReviews){
            return res.status(404).json(
                {
                    success : false,
                    message : "No Review available"
                }
            );
        }

        return res.status(200).json(
            {
                success : true,
                message : "All reviews fetched successfully",
                data : allReviews
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Error while fetching ratings"
            }
        );
    }
}