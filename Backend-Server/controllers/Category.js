const Category = require("../models/Category");



// create tag handler function
exports.createCategory = async (req,res) => {
    try{
        // fetch the data from request body
        const {name,description} = req.body;

        // validation 
        if(!name || !description) {
           return res.status(400).json(
                {
                    success : false,
                    message : "All fields are required"
                }
            ); 
        }

        // if category already exists
        const category = await Category.findOne({name : name});
        if(category){
            return res.status(200).json(
                {
                    success : true,
                    message : "Category already exists"
                }
            );
        }

        // create entry in db
        const categoryDetails = await Category.create(
            {
                name : name,
                description : description
            }
        );

        console.log("Category : ",categoryDetails);

        // success response
        return res.status(200).json(
            {
                success : true,
                message : "Category Created Successfully",
                data : categoryDetails
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Error while creating the Category"
            }
        );
    }
};



// get all category handler function
exports.showAllCategory = async (req,res) => {
    try{
        // get all the tags but make sure name and description is not empty
        const allCategory = await Category.find({},{name:true,description:true});
        return res.status(200).json(
            {
                success : true,
                message : "All Categories are fetched successfully",
                allCategory
            }
        );
    }
    catch(error){
        return res.status(500).json(
            {
                success : false,
                message : "Error while fetching all the Categories"
            }
        );
    }
};


// category page details
exports.categoryPageDetails = async(req,res) => {
    try{
        // get categoryId
        const {categoryId} = req.body;

        // get courses for specified categoryId
        const selectedCategory = await Category.findById({categoryId}).populate("courses").exec();

        // validation 
        if(!selectedCategory) {
            return res.status(404).json(
                {
                    success : false,
                    message : "Category Not Found"
                }
            );
        }

        // Handle the case where there are no course
        if(selectedCategory.courses.length === 0) {
            return res.status(404).json(
                {
                    success : false,
                    message : "No courses found for the selected category"
                }
            );
        }

        // get courses for different categories
        const differentCategories = await Category.find(
            {
                _id : {$ne : categoryId}
            }
        ).populate("courses").exec();

        // get top selling courses across all categories
        const allCategories = await Category.find({})
                                .populate(
                                    {
                                        path : "courses",
                                        match : {satus : "Published"}
                                    }
                                ).exec();

        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0,10);


        // return response
        return res.status(200).json(
            {
                success : true,
                selectedCategory : selectedCategory,
                otherCategory : differentCategories,
                topSelling : mostSellingCourses
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


