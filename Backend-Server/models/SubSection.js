const mongoose = require("mongoose");


// Define SubSection schema
const subSectionSchema = new mongoose.Schema(
    {
        title : {
            type : String,
            required : true,
            trim : true
        },
        timeDuration : {
            type : String,
            required : true,
            trim : true
        },
        description : {
            type : String,
            required : true,
            trim : true
        },
        videoUrl : {
            type : String,
            required : true,
        }
    }
);

// Export the SubSection model
module.exports = mongoose.model("SubSection",subSectionSchema);