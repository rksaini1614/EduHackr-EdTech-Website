const mongoose = require("mongoose");


// Define Course Progress Schema
const courseProgressSchema = new mongoose.Schema(
    {
        courseID : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Course"
        },
        completedVideos : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "SubSection"
        },
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    }
);

// Export the Course Progress model
module.exports = mongoose.model("CourseProgress",courseProgressSchema);