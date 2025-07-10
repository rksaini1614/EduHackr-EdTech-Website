
const express = require("express");
const router = express.Router();

// Impprt the controllers

// Course controller import 
const {
    createCourse,
    getAllCourses,
    getCourseDetails
} = require("../controllers/Course");

  
// category controllers import
const {
    createCategory,
    showAllCategory,
    categoryPageDetails
} = require("../controllers/Category");


//Sections controllers
const {
    createSection,
    updateSection,
    deleteSection
} = require("../controllers/Section");


//Sub - section controllers 
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require("../controllers/SubSection");


//Rating Controllers 
const {
   createReviewAndRating,
    findAverageRating,
    getAllRating
} = require("../controllers/RateAndReview");



// import Middlewares
const {auth,isInstructor,isStudent,isAdmin } = require("../middlewares/auth");



// **************************************************************
//                            Course Routes
// ***************************************************************

// course can only be created by instructor
router.post("/createCourse",auth,isInstructor,createCourse);
// Add a section to a course
router.post("/addSection",auth,isInstructor,createSection);
// Update a section
router.put("/updateSection",auth,isInstructor,updateSection);
// Delete a section
router.delete("/deleteSection",auth,isInstructor,deleteSection);
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);
// Edit Sub Section
router.put("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.delete("/deleteSubSection", auth, isInstructor, deleteSubSection);
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses);
// Get Details for a Specific Courses
router.get("/getCourseDetails", getCourseDetails);



// ************************************************************************
//                                   Category Routes (only by Admin)

router.post("/createCategory",auth,isAdmin,createCategory);
router.get("/showAllCategories", showAllCategory);
router.get("/getCategoryPageDetails", categoryPageDetails);



// Ratirn and Review

router.post("/createRating", auth, isStudent, createReviewAndRating);
router.get("/getAverageRating", findAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;