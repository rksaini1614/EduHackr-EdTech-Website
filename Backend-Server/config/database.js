const mongoose = require("mongoose");
require("dotenv").config();


const dbConnector = () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Database is connected successfully");
    })  
    .catch((error)=>{
        console.log(error);
        console.log("Database connection was unsuccessful");
        process.exit(1);
    })
}

module.exports = dbConnector;