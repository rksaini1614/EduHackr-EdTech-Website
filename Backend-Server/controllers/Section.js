const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");


// create section handler
exports.createSection = async (req,res) => {
    try {
        // data fetch
        const {sectionName,courseId} = req.body;

        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json(
                {
                    success : false,
                    message : "Missing Properties"
                }
            );
        }

        const section = await Section.findOne({sectionName : sectionName});
        if(section) {
            return res.status(200).json(
                {
                    success : true,
                    message : "Section already exists"
                }
            );
        }

        // create section
        const newSection = await Section.create(
            {
               sectionName,
            }
        )

        // update course with section object
        const updatedCourse = await Course.findByIdAndUpdate(
            {_id : courseId},
            {$push : {
                courseContent : newSection._id
            }},
            {new : true}
        )
        .populate({
            path: "courseContent",
            populate: {
            path: "subSection",
            },
        })
        .exec()

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "Section Created Successfully",
                updatedCourse
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : `Failed to create course  : ${error.message}`
            }
        );
    }
}



// update section
exports.updateSection = async (req,res) => {
    try {
        // get the data of section to be updated
        const {newSectionName,sectionId,courseId} = req.body;

        // data validation
        if(!newSectionName || !sectionId || !courseId){
            return res.status(400).json(
                {
                    success : false,
                    message : "Missing Properties"
                }
            );
        }

        const section = await Section.findById({_id : sectionId});
        if(!section ){
            return res.status(404).json(
                {
                    success : false,
                    message : "Section does not Found"
                }
            );
        }    

        // upadate the data
        const updatedSection = await Section.findByIdAndUpdate(
            {_id : sectionId},
            {sectionName : newSectionName},
            {new : true}
        );

        // send the response
        return res.status(200).json(
            {
                success : true,
                message : "Section Updated Successfully",
                updatedSection
            }
        );
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json(
            {
                success : false,
                message : "Unable to Update Section"
            }
        );
    }
}



// delete section
exports.deleteSection = async (req,res) => {
    try {
        // get the data - assuming that we are sending ID in params
        const {sectionId,courseId} = req.body;

        // data validation
        if(!courseId || !sectionId){
            return res.status(400).json(
                {
                    success : false,
                    message : "Missing Properties"
                }
            );
        }

        const section = await Section.findById({_id : sectionId});
        if(!section ){
            return res.status(404).json(
                {
                    success : false,
                    message : "Section does not Found"
                }
            );
        }

        // Delete the associated subsections
        await SubSection.deleteMany({ _id: { $in: section.subSection } })

        // TODO :- delete the entry of all related subsections
        // delete the section fron section db
        await Section.findByIdAndDelete({_id : sectionId});

        // TODO :- do we need to delete from course also
        // delete from course db
        await Course.findByIdAndUpdate(
            {_id : courseId},
            {$pull : {
                courseContent : sectionId
            }},
            {new : true}
        );

        // send response
        return res.status(200).json(
            {
                success : true,
                message : "Section Deleted Successfully",
            }
        );
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json(
            {
                success : false,
                message : "Unable to Delete Section"
            }
        );
    }
}

