const mongoose = require("mongoose");

// Define the Category Schema 
const categorySchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            trim : true
        },
        description : {
            type : String,
            trim : true
        },
        courses : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Course"
            }
        ]
    }
);

// Export the Category Model
module.exports = mongoose.model("Category",categorySchema);