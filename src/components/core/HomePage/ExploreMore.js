import React, { useState } from "react";
import {HomePageExplore} from  "../../../data/homepage-explore";
import HighlightText from "./HighlightText";
import CourseCard from "./CourseCard";


const tabName = [
    "Free",
    "New to coding",
    "Most popular",
    "Skills paths",
    "Career paths"
];


const ExploreMore = () => {

    const [currentTab,setCurrentTab] = useState(tabName[0]);
    const [courses,setCourses] = useState(HomePageExplore[0].courses);
    const [currCard,setCurrCard] = useState(HomePageExplore[0].courses[0].heading);

    const setMyCard = (value) => {
        setCurrentTab(value);
        const result = HomePageExplore.filter((course) => course.tag === value);
        setCourses(result[0].courses);
        setCurrCard(result[0].courses[0].heading);
    }

    return(
        <div >
            <div className="text-4xl font-semibold text-center my-2">
                Unlock the 
                <HighlightText text={"Power of Code"}></HighlightText>
            </div>

            <p className=" text-md text-richblack-300 text-center mt-1">
                Learn to build anything you can imagine
            </p>

            <div className="hidden lg:flex gap-5 w-max mx-auto bg-richblack-800 rounded-full mb-5 border border-richblack-500 mt-10 p-1 
            font-medium">
                {
                    tabName.map((element,index) =>{
                        return (
                            <div 
                            className={`text-[16px] flex flex-row items-center gap-2
                                ${currentTab === element ? "bg-richblack-900 text-richblack-5 font-medium" 
                                    : "text-richblack-200"} rounded-full transition-all duration-200 
                                    cursor-pointer hover:bg-richblack-900 hover:text-richblack-5 px-7 py-2`} key={index}
                                    onClick={() => setMyCard(element)}
                            >
                                {element}
                            </div>
                        )
                    } )
                }
            </div>

            <div className="hidden lg:block lg:h-[200px]"></div>

            <div className="lg:absolute gap-10 justify-center lg:gap-0 flex lg:justify-between flex-wrap w-full lg:bottom-[0] lg:left-[50%] 
            lg:translate-x-[-50%] lg:translate-y-[50%] text-black lg:mb-0 mb-10 lg:px-0 px-3 mt-20">

                
                    {
                        courses.map((element,index) =>{
                            return (
                                <CourseCard key={index}
                                cardData = {element}
                                currentCard = {currCard}
                                setCurrentCard = {setCurrCard}/>
                            )
                        })
                    }
                
            </div>

        </div>
    )
}

export default ExploreMore;