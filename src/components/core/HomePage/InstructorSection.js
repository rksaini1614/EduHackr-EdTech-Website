import React from "react";
import instructor from "../../../assets/Images/Instructor.png";
import HighlightText from "./HighlightText";
import CTAButton from "./Button"
import { FaArrowRight } from "react-icons/fa";

const InstructorSection = () => {
    return (
        <div className="mt-16">
            <div className="flex gap-20 items-center">

                <div className="lg:w-[50%]">
                    <img src={instructor} className="shadow-white shadow-[-15px_-15px]"/>
                </div>

                <div className="lg:w-[50%] flex flex-col gap-10">
                    <div className="text-4xl font-semibold lg:w-[50%]">
                        Become an 
                        <HighlightText text={"Instructor"}/>
                    </div>
                    <p className="text-[16px] font-medium w-[80%] text-richblack-300">
                        Instructors from around the world teach millions of students on EduHackr. We 
                        provide the tools and skills to the teach what you love.
                    </p>

                    <div className="w-fit">
                        <CTAButton active={true} linkto={"/signup"}>
                        <div className="flex items-center gap-2">
                            Start Teaching Today
                            <FaArrowRight></FaArrowRight>
                        </div>
                        </CTAButton>

                    </div>
                </div>

            </div>


        </div>
    )
}

export default InstructorSection;