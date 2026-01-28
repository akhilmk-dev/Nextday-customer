import React, { useContext, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { myContext } from "../utils/context_api/context";
import logo from "../images/main-logo 1.png";
import { FaFacebook } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import CustomInputField from "../components/input-field/CustomInput";
import Button from "../components/button/Button";
import LoginWith_OTP from "../pages/LoginWith_OTP";
import RegisterPage from "./RegisterPage";
import ForgotPassword from "./ForgotPassword";
import { useGlobalFormik } from "../utils/custom-hooks/formik-hook/useGlobalFormik";
import {
  loginSchema,
  loginInitialValues,
} from "../utils/validation-schema/auth-schema/authSchema";
import request from '../utils/request';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import ClipLoader from "react-spinners/ClipLoader";

const LoginPage = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    clickRegister,
    setClickRegister,
    clickForgotPassword,
    setClickForgotPassword,
    setVerifiedMobile,
    isLogin,
    setIsLogin,
    setUserData,
    userType,
    setUserType

  } = useContext(myContext);

  // const authInfo = useSelector(selectAuthdata);

  const [clickOtpLogin, setClickOtpLogin] = useState(false);
  const [userNameError, setUserNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile,setIsMobile] = useState('');

  const navigate = useNavigate();

  //formik validation
  const formik = useGlobalFormik(loginInitialValues, loginSchema, (values) => {
    setUserNameError('')
    setPasswordError('')
    setIsLoading(true)
    request({
      url: `V1/login`,
      method: 'POST',
      data: {
        "username": values?.email,
        "password": values?.password
      }
    })
      .then((response) => {
        if (response.data.length > 0) {
          localStorage.setItem('userData', JSON.stringify(response.data[0]));
          localStorage.setItem('accessToken', response.data[0]?.accessToken)
          localStorage.setItem('refreshToken', response.data[0]?.refreshToken)
          setIsLoginModalOpen(false)
          setIsLogin(true)
          setIsLoading(false)
          setUserType(response.data[0].userRole)
          setUserData(response.data[0])
          navigate(`home/${response.data[0].userRole.toLowerCase()}/dashboard`)
          setTimeout(() => {
            toast.dismiss();
            toast.success('Logged in successfully')
          }, 1000)
        }
      })
      .catch(function (err) {
        setIsLoading(false)
        if (err.response.status === 400) {
          err.response.data.errors.forEach((item) => {
            if (item.path === "username") {
              setUserNameError(item.msg)
            } else if (item.path === "password") {
              setPasswordError(item.msg)
            }
          })
        }else if (err.response.status == 500) {
          toast.dismiss();
          toast.error(err.response.data.message)
        }else{
          toast.dismiss();
          toast.error("Something went wrong")
        }
      });
  }
  );

  const handleForgotPasswordClick = () => {
    setClickForgotPassword(true);
  };

  const handleLoginwithOtp = () => {
    setClickOtpLogin(true)
    setVerifiedMobile(true)
  }

  const isFirstCharNumber = (str) => /^\d/.test(str[0] || '')

  return (
    <>
      <Dialog open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} className="relative z-[9999]">
        <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-0 w-screen overflow-y-auto">
          <div className="flex min-h-full  justify-center text-center items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pt-8 sm:pb-8">
                {clickForgotPassword ? (
                  <ForgotPassword />
                ) : (
                  <>
                    {clickRegister ? (
                      <RegisterPage  setIsLoginModalOpen={ setIsLoginModalOpen}/>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <div className="flex items-center">
                              <p className="font-sansation font-regular">Welcome back to</p>
                              <div className="w-[6rem] p-1 pt-[6px]">
                                <img src={logo} alt="logo" />
                              </div>
                            </div>
                            <p className="bold-sansation text-4xl">{"Customer Login"}</p>
                          </div>
                          <div className="flex justify-end">
                            <div>
                              <p className="font-sansation font-regular">No Account?</p>
                              <p
                                className="bold-sansation text-xl text-custom-green cursor-pointer"
                                onClick={() => setClickRegister(true)}
                              >
                                Register
                              </p>
                            </div>
                          </div>

                          <div className="col-span-2 mt-3">
                            <div className="flex gap-3">
                              {clickOtpLogin ? (
                                <div
                                  className="w-full flex items-center justify-center p-2 hover:shadow-md cursor-pointer rounded-lg bg-[#F6F6F6]"
                                  onClick={() => setClickOtpLogin(false)}
                                >
                                  <p className="text-[#005EB5] font-sansation font-regular">
                                    Login with Password
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className="w-full flex items-center justify-center p-2 hover:shadow-md cursor-pointer rounded-lg bg-[#F6F6F6]"
                                  onClick={handleLoginwithOtp}
                                >
                                  <p className="text-[#005EB5] font-sansation font-regular">
                                    Login with OTP
                                  </p>
                                </div>
                              )}

                              {/* <div className="w-full flex items-center p-2 hover:shadow-md cursor-pointer rounded-lg bg-[#F6F6F6] gap-3 justify-center">
                                <FcGoogle className="text-3xl" />
                                <p className="text-[#005EB5] font-sansation font-regular">
                                  Login with Google
                                </p>
                              </div> */}

                              {/* <div className="w-1/4 flex items-center justify-center p-2 hover:shadow-md cursor-pointer bg-[#F6F6F6] rounded-lg">
                                <FaFacebook className="text-[#005EB5] text-3xl" />
                              </div> */}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1">
                          {clickOtpLogin ? (
                            <LoginWith_OTP />
                          ) : (
                            <form onSubmit={formik.handleSubmit}>
                              <CustomInputField
                                title="Enter your phone/email address"
                                type={isFirstCharNumber(isMobile) ? "number":"text"}
                                placeholder="Enter your phone/email address"
                                name="email"
                                isMandatory={true}
                                value={formik.values.email}
                                onChange={(e)=>{
                                  formik.handleChange(e)
                                  setIsMobile(e.target.value)
                                }}
                                onBlur={formik.handleBlur}
                                error={formik.errors.email}
                                touched={formik.touched.email}
                                mobile={isFirstCharNumber(isMobile)}
                              />
                              <span className="text-red-500">{userNameError}</span>
                              <CustomInputField
                                title="Enter Your Password"
                                type="password"
                                placeholder="Enter Your Password"
                                name="password"
                                isMandatory={true}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.password}
                                touched={formik.touched.password}
                                showForgotPassword={true}
                                clickForgotPassword={handleForgotPasswordClick}
                              />
                              <span className="text-red-500">{passwordError}</span>
                              <div className="bold-sansation pt-5">
                                <Button 
                                  // buttonText={`${isLoading ? <ClipLoader color="white" size={20}/> : "LOGIN"}`}
                                  buttonText={isLoading ? <ClipLoader color="white" size={20} /> : "LOGIN"} 
                                  // icon={<PulseLoader color="white"
                                  // loading={isLoading}
                                  // size={10}
                                  // aria-label="Loading Spinner"
                                  // data-testid="loader" />} 
                                  type="submit" className="w-full" />
                              </div>
                            </form>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default LoginPage;

