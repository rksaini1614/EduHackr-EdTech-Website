const mongoose = require("mongoose");

// Define the Course Schema
const courseSchema = new mongoose.Schema(
    {
        courseName : {
            type : String,
            required : true,
            trim : true
        },
        description : {
            type : String,
            required : true,
            trim : true
        },
        instructor : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : "User"
        },
        learnings : {
            type : String,
            required : true,
            trim : true
        },
        courseContent : [
            {
                type : mongoose.Schema.Types.ObjectId,
                required : true,
                ref : "Section" 
            }
        ],
        ratingAndReviews : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "RatingAndReview" 
            }
        ],
        price : {
            type : Number,
            required : true
        },
        thumbnail : {
            type : String,
            required : true
        },
        category : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Category",
            required : true
        },
        tag : {
            type : [String],
            trim : true,
            required : true
        },
        studentEnrolled : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        ],
        instructions : {
            type : [String]
        },
        status : {
            type : String,
            enum : ["Draft","Published"]
        },
        createdAt : {
            type : Date,
            default : Date.now()
        }
    }
);

// Export the Course Model
module.exports = mongoose.model("Course",courseSchema);