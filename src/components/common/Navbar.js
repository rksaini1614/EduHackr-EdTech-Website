import react, { useEffect, useState } from "react";
import { Link, matchPath, NavLink } from "react-router-dom";
import logo from "../../assets/Logo/logo1.png";
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import { categories } from "../../services/apis";
import { apiConnector } from "../../services/apiConnector";
import { IoIosArrowDown } from "react-icons/io";



const Navbar = () => {

    const {token} = useSelector((state) => state.auth);
    const {user} = useSelector((state) => state.profile);
    const {totalItems} = useSelector((state) => state.cart);
    const location = useLocation();

    const [subLinks,setSubLinks] = useState([]);

    const fetchSubLinks = async() => {
        try{
            const result = await apiConnector("GET",categories.CATEGORIES_API);
            console.log("Printing sublinks data : ",result.data.allCategory);
            setSubLinks(result.data.allCategory);
        }
        catch(error) {
            console.log("Could not fetch the category list");
        }
    }

    useEffect (() => {
        fetchSubLinks();
    },[]);

    const matchRoute = (route) => {
        return matchPath({path:route},location.pathname);
    }

    return (
        <div className="flex lg:h-18 items-center justify-center border-b-[1px] border-b-richblack-700">
            <div className="flex w-11/12 max-w-maxContent mx-auto items-center justify-between">
                <Link to="/">
                    <img src={logo} className="lg:h-[60px] lg:w-[200px] object-contain"/>
                </Link>

                <nav>
                    <ul className="flex gap-x-6 text-richblack-25">
                        {
                            NavbarLinks.map((link,index)=>{
                                return(
                                <li key={index}>
                                    {
                                        link.title === "Catalog" ? (
                                            <div className="flex items-center gap-x-1 group cursor-pointer relative">
                                                <p>{link.title}</p>
                                                <IoIosArrowDown/>

                                                <div className="invisible absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[20%]  flex z-[1000]
                                                flex-col rounded-md bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 
                                                group-hover:visible group-hover:opacity-100 lg:w-[250px] gap-1">
                                                    <div className="h-6 w-6 absolute left-[50%] top-0 rotate-45 
                                                bg-richblack-5  translate-y-[-45%]
                                                translate-x-[80%]">
                                                    </div>

                                                    {
                                                        subLinks.length  ? (
                                                                subLinks.map((subLink,index)=>(
                                                                    <div className="rounded py-2 px-2 hover:bg-richblack-50">
                                                                        <Link to={`/catalog/${subLink.name}`} key={index}>
                                                                        {subLink.name}
                                                                        </Link>
                                                                    </div>
                                                                ))
                                                            
                                                        ) : (<div></div>)
                                                    }
                                                </div>

                                            </div>

                                        ) : (
                                            <Link to={link?.path}>
                                                <p className={`${matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>{link.title}</p>
                                            </Link>
                                        )
                                    }
                                </li>)
                            })
                        }
                    </ul>
                </nav>

                {/*Login/signup/dashboard*/}
                <div className="flex gap-x-4 items-center">

                    {
                        user && user?.accountType !== "Instructor" && (
                            <Link to={"/dashboard/cart"} className="relative">
                                <AiOutlineShoppingCart/>
                                {
                                    totalItems > 0 && (
                                        <span>{totalItems}</span>
                                    )
                                }
                            </Link>
                        )
                    }

                    {
                        token === null && (
                            <Link to="/login">
                                <button className="text-richblack-100 bg-richblack-800 
                                py-2 px-3 rounded-md border border-richblack-700">
                                    Log in
                                </button>
                            </Link>
                        )
                    }
                    {
                        token === null && (
                            <Link to="/signup">
                                <button className="text-richblack-100 bg-richblack-800 
                                py-2 px-3 rounded-md border border-richblack-700">
                                    Sign in
                                </button>
                            </Link>
                        )
                    }
                    {
                        token !== null && <ProfileDropDown/>
                    }
                    
                </div>
            </div>
        </div>
    )
}

export default Navbar;