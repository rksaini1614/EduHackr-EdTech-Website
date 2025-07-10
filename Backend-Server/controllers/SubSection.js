const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadFileToCloudinary} = require("../utils/fileUploader")
require("dotenv").config();



// create Subsection
exports.createSubSection = async (req,res) => {
    try{
        // fetch data from req body
        const {sectionId,title,description,timeDuration} = req.body;

        // extract file/video
        const videoFile = req.files.videoFile;

        // validation
        if(!title || !timeDuration || !description || !videoFile || !sectionId){
            return res.status(400).json(
                {
                    success : false,
                    message : "All Fields are required"
                }
            );
        }

        const checkPresentSubSecion = await SubSection.findOne({title : title});
        if(checkPresentSubSecion) {
            return res.status(200).json(
                {
                    success : true,
                    message : "SubSection already exists"
                }
            );
        }

        // uplaod video to cloudinary
        const uploadedVideo = await uploadFileToCloudinary(videoFile,process.env.FOLDER_NAME);

        // create a subsection
        const subSection = await SubSection.create(
            {
                title,
                timeDuration : `${uploadedVideo.duration}`,
                description,
                videoUrl : uploadedVideo.secure_url
            }
        );

        console.log("Subsection : ",subSection);

        // update section with this subsection
        const updatedSection = await Section.findByIdAndUpdate(
            {_id : sectionId},
            {$push : {
                subSection : subSection._id
            }},
            {new : true}
        );

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "SubSection Created Successfully",
                updatedSection
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
}



// update the subsection
exports.updateSubSection = async (req,res) => {
    try{
        // get the data from request body
        const {subSectionId,title,timeDuration,description} = req.body;

        // validate
        const subSection = await SubSection.findById({_id : subSectionId});
        if(!subSection){
            return res.status(404).json(
                {
                    success : false,
                    message : "Subsection do not Found"
                }
            );
        }

        //update the subsection
        if(title !== undefined){
            subSection.title = title;
        }

        if(description !== undefined) {
            subSection.description = description;
        }

        if(timeDuration !== undefined){
            subSection.timeDuration = timeDuration;
        }

        if(req.files && req.files.videoFile !== undefined){
            const updatedVideoFile = await uploadFileToCloudinary(videoFile,process.env.FOLDER_NAME);
            subSection.videoUrl = updatedVideoFile.secure_url;
            subSection.timeDuration = `${updatedVideoFile.duration}`
        }

        const updatedSubsection = await subSection.save();

        // return response
        return res.json(
            {
                success: true,
                message: "Section updated successfully",
                updatedSubsection
            }
        );
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json(
            {
                success : false,
                message : "Failed to Update SubSection"
            }
        );
    }
}


// delete the subsection
exports.deleteSubSection = async (req,res) => {
    try{
        // get the data
        const {subSectionId,sectionId} = req.body;

        // validate
        if(!subSectionId || !sectionId){
            return res.status(400).json(
                {
                    success : false,
                    message : "All fields are required"
                }
            );
        }

        // check whether subsection exists or not
        const subSection = await SubSection.findById({_id : subSectionId});
        if(!subSection) {
            return res.status(404).json(
                {
                    success : false,
                    message : "Subscetion Not Found"
                }
            );
        }

        // delete the subsection
        const updatedSubSection = await SubSection.findByIdAndDelete({_id : subSectionId});

        // update the section
        const updatedSection = await Section.findByIdAndUpdate(
            {_id : sectionId},
            {$pull : {
                subSection : updatedSubSection._id
            }},
            {new : true}
        );

        // return response
        return res.status(200).json(
            {
                success : true,
                message : "Subsection Deleted Successfully",
                data : updatedSection
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Failed to Delete SubSection"
            }
        );
    }
}

