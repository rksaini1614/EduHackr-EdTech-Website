const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payment");
const courseRoutes = require("./routes/Course");
const contactRoutes = require("./routes/Contact");

const dbConnector = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

const { authenticator,totp } = require('otplib');


// fetch port number
dotenv.config();
const PORT = process.env.PORT || 4000;

// datavase connect
dbConnector();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors(
        {
            origin : "http://localhost:3000",
            credentials : true
        }
    )
);

app.use(
    fileUpload(
        {
            useTempFiles : true,
            tempFileDir : "./tmp/"
        }
    )
);

// cloudinary connection
cloudinaryConnect();


// routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);


// default route
app.get("/",(req,res) => {
    return res.status(200).json(
        {
            success : true,
            message : "Server is up and running"
        }
    );
});

// const secret = authenticator.generateSecret(); // base32 format
// console.log('Your secret:', secret);
// const otp = totp.generate(secret);
// console.log('TOTP:', otp);


// start server at port
app.listen(PORT,()=>{
    console.log(`App is running at port ${PORT}`);
});

