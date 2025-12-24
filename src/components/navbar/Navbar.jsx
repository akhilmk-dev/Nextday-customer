import { useState, useContext, useEffect, useRef } from "react";
import logo from "../../images/VerticalBorder.png";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { IoMail } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";
import Button from "../button/Button";
import { myContext } from "../../utils/context_api/context";
import { useLocation, useNavigate } from "react-router-dom";
import LoginPage from "../../pages/LoginPage";
import { Toaster } from "react-hot-toast";
import Dropdown from "../Dropdowns/Dropdown";
import LogOutModal from "../Modals/LogOutModal";
// import { selectAuthdata, setAuthData, } from "../../slices/authSlice";
// import { useDispatch, useSelector } from "react-redux";

function Navbar({ className }) {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [logOutConfirm, setLogOutConfirm] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setIsAccountModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };
  // const dispatch = useDispatch()
  const { isLoginModalOpen, setIsLoginModalOpen, isLogin, setIsLogin, userData, userType, setAddressList } =
    useContext(myContext);

  // const authInfo = useSelector(selectAuthdata);
  const navigate = useNavigate();

  //   useEffect(()=>{
  //     fetchLogedUserInfo()
  //   },[])

  //   const fetchLogedUserInfo = () => {
  //     let data = localStorage.getItem('userData');
  //     if(data){
  //         dispatch(setAuthData({ authData: JSON.parse(data) }))
  //     }
  // }

  const logOut = () => {
    sessionStorage.clear();
    localStorage.clear();
    setIsAccountModalOpen(false)
    setAddressList([])
    setIsLogin(false);
    setIsOpen(false);
    setLogOutConfirm(false);
    navigate('/')
  }

  const menuItems = [
    { label: "Home", path: "/", hasPlus: true },
    { label: "About Us", path: "/about-us", hasPlus: false },
    { label: "Services", path: "/services", hasPlus: true },
    { label: "Blog", path: "/blog", hasPlus: true },
    { label: "Contact Us", path: "/contact-us", hasPlus: false },
    { label: "Tracker", path: "/pincode-finder", hasplus: false }
  ];

  const handleClose = () => {
    setLogOutConfirm(false);
    setIsAccountModalOpen(false);
    setIsOpen(false);
  }
  const handleConfirm = () => {
    setLogOutConfirm(true);
  }

  useEffect(() => {
    if (isOpen && logOutConfirm) {
      logOut();
    }
  }, [isOpen, logOutConfirm])

  return (
    <>
      <LogOutModal isOpen={isOpen} onClose={handleClose} onConfirm={handleConfirm} title="Log Out" message="Are you sure you want to logout ?" />
      <div className={`${isLogin ? "bg-[#0C1118]" : ""} ${className}`}>
        <Toaster containerStyle={{
          zIndex: 10001, // Ensure container has higher z-index
        }} duration={5000} />
        <nav>
          <div className="max-w-full fixed left-0 right-0 lg:relative mb-[117px] lg:mb-[0px]" style={{ backgroundColor: "black", zIndex: 999 }}>
            <div className="flex justify-between container mx-auto w-full">
              {/* Primary menu and logo */}
              <div className="flex justify-start  w-full">
                {/* Logo */}
                <div>
                  <a
                    href="/"
                    className="flex gap-1 font-bold text-gray-700 w-[14rem]"
                  >
                    <img src={logo} alt="logo" className="" />
                  </a>
                </div>

                {/* Primary navigation */}
                <div className=" flex flex-col justify-center w-full">
                  <div className="hidden lg:flex justify-between  items-center gap-2 bg-black text-custom-white">
                    <div className="flex items-center gap-2">
                      <div className="flex-none font-sansation font-regular text-xs flex gap-1 ml-3 p-2 items-center ">
                        <IoMail className="text-custom-green" />
                        <p>csm@nextday.services</p>
                      </div>
                      <div className="flex-none  font-sansation font-regular text-xs  flex gap-1  p-2 items-center ">
                        <IoMdTime className="text-custom-green" />
                        <p>Mon - Fri 09:00 AM - 05:00 PM</p>
                      </div>
                    </div>

                    <div className="flex justify-between  items-center gap-2">
                      <div className="flex-none  font-sansation font-regular text-xs flex gap-1 p-2 items-center cursor-pointer ">
                        {isLogin ? (
                          <>
                            {/* <FaLocationDot className="text-custom-green" /> */}
                            <p></p>
                          </>
                        ) : (
                          <div className="bg-red-400"></div>
                        )}
                      </div>
                      <div
                        className="flex-none font-sansation font-regular text-xs flex gap-1  p-2 relative"
                        ref={modalRef}
                      >
                        {isLogin ? (
                          <>
                            <div className="flex items-center gap-1 cursor-pointer " onClick={() => setIsAccountModalOpen(!isAccountModalOpen)}>

                              <FaUserCircle className="text-custom-green " />
                              <p>{userData.fullName}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* <FaLocationDot className="text-custom-green" /> */}
                            <p></p>
                          </>
                        )}

                        {isAccountModalOpen && (
                          <div className="absolute top-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                            <div className="flex flex-col">
                              <button
                                className="flex items-center px-4 py-2 rounded-md text-custom-green hover:bg-gray-200"
                                onClick={() => { navigate(`/home/${userType.toLowerCase()}/my-profile`); setIsAccountModalOpen(false); }}
                              >
                                <FaUserCircle className="mr-2" />
                                Profile
                              </button>
                              <button
                                className="flex items-center px-4 rounded-md py-2 text-custom-green hover:bg-gray-200"
                                onClick={() => setIsOpen(true)}
                              >
                                <FaArrowRight className="mr-2" />
                                Logout
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-3 p-2 text-xs">
                        {isLogin ? (<p>|</p>) : (<p></p>)}
                        <p title="Facebook">
                          <FaFacebookF className="cursor-pointer hover:text-custom-green" />
                        </p>
                        <p title="Twitter">
                          <FaTwitter className="cursor-pointer hover:text-custom-green" />
                        </p>
                        <p title="Linkedin">
                          <FaLinkedinIn className="cursor-pointer hover:text-custom-green" />
                        </p>
                        <p title="Instagram">
                          <FaInstagram className="cursor-pointer hover:text-custom-green" />
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex h-3/4 justify-between  items-center gap-2 text-custom-white ">
                    <div className="flex justify-center w-3/4 gap-4">
                      {menuItems?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 hover:text-custom-green cursor-pointer"
                          onClick={() => navigate(item.path)}
                        >
                          <button className="btn ">{item.label}</button>
                          {item.hasPlus && <FaPlus className="text-xs" />}
                        </div>
                      ))}
                    </div>

                    <div className=" w-3/4 gap-2 flex justify-end ">
                      {isLogin ? (
                        <>
                          {currentPath !== "/create-pickup-request" && <Button
                            buttonText="Request Pickup"
                            icon={<FaArrowRight />}
                            className=" "
                            onClick={() => navigate(`/create-pickup-request`)}
                          />}
                          {currentPath !== "/create-pickup" && <Button
                            buttonText="Create Booking"
                            icon={<FaArrowRight />}
                            className=" "
                            onClick={() => {
                              sessionStorage.removeItem("package")
                              sessionStorage.removeItem("pickupOptions")
                              sessionStorage.removeItem("selectedConsigner");
                              sessionStorage.removeItem("selectedConsignee");
                              // sessionStorage.clear();
                              navigate(`/create-pickup`)
                            }}
                          />}
                        </>
                      ) : (
                        <div className="relative inline-block">
                          <Button
                            buttonText="Login"
                            icon={<FaArrowRight />}
                            className=""
                            onClick={() => setIsLoginModalOpen(true)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary navigation */}
              <div className="flex gap-6">
                {/* Mobile navigation toggle */}
                <div className="lg:hidden flex items-center mx-3">
                  <button onClick={() => setToggleMenu(!toggleMenu)}>
                    {toggleMenu ? (
                      <XMarkIcon color="white" className="h-6" />
                    ) : (
                      <Bars3Icon color="white" className="h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile navigation */}
          <div
            className={`fixed z-40 w-full bg-gray-100 font-sansation overflow-y-auto scrollbar-hide flex flex-col lg:hidden gap-12 origin-top duration-700 pt-[116px] lg:pt-0 ${!toggleMenu ? "h-0" : "h-full"}`}
          >
            <div className="px-5 py-4">
              {isLogin ? (
                <div className="flex flex-col gap-1 font-bold tracking-wide pb-3">
                  {/* Profile */}
                  <div
                    className="flex items-center justify-between px-2 py-2 hover:bg-custom-green hover:text-white transition-colors cursor-pointer"
                    onClick={() => {
                      navigate(`/home/${userType.toLowerCase()}/my-profile`);
                      setToggleMenu(!toggleMenu);
                    }}
                  >
                    <span>Profile</span>
                    <FaUserCircle className="text-lg" />
                  </div>

                  {/* Logout */}
                  <div
                    className="flex items-center justify-between px-2 py-2 hover:bg-custom-green hover:text-white transition-colors cursor-pointer"
                    onClick={()=>setIsOpen(true)}
                  >
                    <span>Logout</span>
                    <FaArrowRight className="text-lg" />
                  </div>

                  {/* Action Buttons */}
                  <>
                    {currentPath !== "/create-pickup-request" && (
                      <div
                        className="flex items-center justify-between px-2 py-2 hover:bg-custom-green hover:text-white transition-colors cursor-pointer"
                        onClick={() => {
                          navigate(`/create-pickup-request`);
                          setToggleMenu(!toggleMenu);
                        }}
                      >
                        <span>Request Pickup</span>
                        <FaArrowRight className="text-lg" />
                      </div>
                    )}
                    {currentPath !== "/create-pickup" && (
                      <div
                        className="flex items-center justify-between px-2 py-2 hover:bg-custom-green hover:text-white transition-colors cursor-pointer"
                        onClick={() => {
                          sessionStorage.removeItem("package");
                          sessionStorage.removeItem("pickupOptions");
                          navigate(`/create-pickup`);
                          setToggleMenu(!toggleMenu);
                        }}
                      >
                        <span>Create Booking</span>
                        <FaArrowRight className="text-lg" />
                      </div>
                    )}
                  </>
                </div>
              ) : (
                <div className="flex flex-col gap-4 font-bold tracking-wide py-3">
                  <div
                    className="flex items-center justify-between px-2 py-2 hover:bg-custom-green hover:text-white transition-colors cursor-pointer"
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setToggleMenu(!toggleMenu);
                    }}
                  >
                    <span>Login</span>
                  </div>
                </div>
              )}

              <div className="mt-1 border-t pt-4 flex flex-col gap-1 font-bold tracking-wide">
                {menuItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-2 py-2 hover:bg-custom-green hover:text-white transition-colors cursor-pointer"
                    onClick={() => { navigate(item.path); setToggleMenu(!toggleMenu); }}
                  >
                    <button className="btn rounded-md ">
                      {item.label}
                    </button>
                    {item.hasPlus && <FaPlus className="text-xs" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
      {isLoginModalOpen && <LoginPage />}
    </>
  );
}

export default Navbar;

Navbar
