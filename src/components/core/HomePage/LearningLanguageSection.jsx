import React from "react";
import HighlightText from "./HighlightText";
import image1 from "../../../assets/Images/Know_your_progress.png";
import image2 from "../../../assets/Images/Compare_with_others.png";
import image3 from "../../../assets/Images/Plan_your_lessons.png";
import CTAButton from "../HomePage/Button";


const LearningLanguageSection = () =>{
    return (
        <div>
            <div className="flex flex-col gap-5 my-10 items-center ">

                <div className="text-4xl font-bold mt-20">
                    Your swiss knife for
                    <HighlightText text={"learning any language"}></HighlightText>
                </div>

                <div className="text-center text-base text-richblack-600 font-medium mx-auto w-[70%]">
                    Using spin making learning multiple languages easy. With 20+
                languages realistic voice-over, progress tracking, custom schedule
                and more.
                </div>

                <div className="flex items-center justify-center mt-4">
                        <img src={image1} alt="" 
                        className="object-contain -mr-32"></img>

                        <img src={image2} alt = "" 
                        className="object-contain"></img>

                        <img src={image3} alt="" 
                        className="object-contain -ml-36"></img>
                    
                </div>

                <div className="w-fit mb-10">
                    <CTAButton active={true} linkto={"/signup"}>
                        Learn More
                    </CTAButton>
                </div>

            </div>

        </div>
    )
}

export default LearningLanguageSection;