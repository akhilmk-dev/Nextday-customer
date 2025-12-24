import React, { useContext } from "react";
import { useState, useEffect } from "react";
import bg from "../images/ListboxOption.png";
import svg from "../images/SVG.png";
import { FaArrowRight } from "react-icons/fa";
import About from "../components/landing_page/About";
import Logistics_Services from "../components/landing_page/Logistics_Services";
import We_Offer from "../components/landing_page/We_Offer";
import Working_Process from "../components/landing_page/Working_Process";
import Button from "../components/button/Button";
import { useGlobalFormik } from "../utils/custom-hooks/formik-hook/useGlobalFormik";
import ReCAPTCHA from 'react-google-recaptcha';
// import {
//   order_awb_validationSchema,
//   order_awb_InitialValues,
// } from "../utils/validation-schema/tracking-schema/trackingSchema";
import CustomInputField from "../components/input-field/CustomInput";
import Navbar from "../components/navbar/Navbar";
import Spinner from "../components/spinner/Spinner";
import { myContext } from "../utils/context_api/context";
import GooglePlayButton from "../components/button/GooglePlayButton";
import AppStoreButton from "../components/button/AppstoreButton";
import Select from 'react-select';
import request from '../utils/request';
import { TiTick } from "react-icons/ti";
import { IoClose } from "react-icons/io5";
import { locationFinderInitialValues, locationFinderValidationSchema } from "../utils/validation-schema/auth-schema/authSchema";
import TrackingCard3 from "../components/card/TrackingCard3";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  // ----------------- hooks ----------------------
  const [isAwbSelected, setIsAwbSelected] = useState(true);
  const [isOrderSelect, setIsOrderSelect] = useState(false);
  const [clickLocation, setClickLocation] = useState(true);
  const [countryInfo, setCountryInfo] = useState([]);
  const [selectedState, setSelectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [pincodeList, setPincodeList] = useState([])
  const [selectedPincode, setSelectedPincode] = useState()
  const [locationData, setLocaitonData] = useState()
  const [isVisible, setIsVisible] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(false);
  const { login } = useContext(myContext);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [locationLoader, setLocationLoader] = useState(false);
  const navigate = useNavigate();

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  useEffect(() => {
    request({
      url: "V1/locations",
      method: "GET"
    }).then((response) => {
      setCountryInfo(response.data)
    }).catch((err) => {
      if (err.response.status == 500) {
        toast.dismiss();
        toast.error(err.response.data.message)
      }
    })
  }, []);

  const handleTrack = () => {
    navigate(`/pincode-finder?id=${formik.values?.trackingId}`)
  }

  const formik = useGlobalFormik(locationFinderInitialValues, locationFinderValidationSchema,
    (values) => {
      setLocationLoader(true);
      request({
        url: `V1/service-availability?stateId=${selectedState}&cityId=${selectedCity}&pincode=${selectedPincode}`,
        method: "GET",
      }).then((response) => {
        setLocaitonData(response?.data[0]);
        setLocationLoader(false);
      }).catch((error) => {
        if (error.response.status == 500) {
          toast.dismiss();
          toast.error(err.response.data.message);
        }
        setLocationLoader(false);
      })
    });
  // ----------------- hooks end here -------------

  // ------- Function to handle tab selection ---------
  const handleSelectionClick = (isAwb) => {
    setIsAwbSelected(isAwb);
  };

  const countryOptions = countryInfo.map(item => (
    {
      label: item?.countryName,
      value: item?.countryId
    }
  ))

  // state selection dropdown options
  let stateOptions = countryInfo[0]?.states?.map((item) => ({
    label: item.stateName,
    value: item.stateId
  }))

  // city selection dropdown options
  let cityOptions = countryInfo[0]?.states.filter(item => item.stateId === selectedState)[0]?.cities?.map((city) => ({
    label: city.cityName,
    value: city.cityId
  }))

  useEffect(() => {
    if (selectedCity) {
      request({
        url: `V1/pincodes/${selectedCity}`,
        method: "GET",
      }).then((response) => {
        setPincodeList(response?.data)
      }).catch((err) => {
        if (err.response.status == 500) {
          toast.dismiss();
          toast.error(err.response.data.message)
        }
      })
    }
  }, [selectedCity])

  // useEffect(()=>{
  //   setSelectedCity('')
  //   setSelectedPincode('')
  // },[selectedState])

  // useEffect(()=>{
  //   setSelectedPincode('')
  // },[selectedCity])

  let pincodeOptions = pincodeList?.map(item => ({ label: item.pincode, value: item.pincodeId }))

  const customStyles = {
    input: (provided) => ({
      ...provided,
      padding: '6px',
    }),
  }
  // ------- Function to handle tab selection end ---------

  useEffect(() => {
    // Reset city and pincode when state changes
    setSelectedCity(null);
    setSelectedPincode(null);
    formik.setFieldValue('city', '');
    formik.setFieldValue('pincode', '');
  }, [selectedState]);

  useEffect(() => {
    // Reset pincode when city changes
    setSelectedPincode(null);
    formik.setFieldValue('pincode', '');
  }, [selectedCity]);


  return (
    <>
      <div
        style={{
          backgroundImage: `url(${bg})`,
        }}
        className="bg-cover bg-center bg-no-repeat"
      >
        <Navbar />
        <div className=" flex items-center justify-center h-auto  lg:min-h-[650px] border-t-[0.1rem] border-gray-600 Best pt-[116px] lg:pt-0">
          <div className=" grid grid-cols-1 lg:grid-cols-2 gap-10 container mx-auto ">
            <div className=" px-5 py-4 flex justify-center items-center sm:block ">
              <div>
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <img src={svg} alt="Logistics Icon" />
                  <p className="text-custom-green text-lg font-sansation font-bold">
                    We’re best logistics offer
                  </p>
                </div>
                <div className="py-5 text-6xl text-white  md:text-left text-left font-sansation font-bold">
                  <h1 className="mb-2">Best Domestic</h1>
                  <h1 className="mb-2">Logistics</h1>
                  <h1>Network</h1>
                </div>
                <Button
                  buttonText="Load more"
                  icon={<FaArrowRight />}
                  className="px-3 "
                  onClick={()=>navigate('/services')}
                />
              </div>
            </div>
            <div className=" my-10 mx-8 lg:mx-0 flex justify-end " >
              <div className="bg-white border-2 border-solid border-black rounded-md flex-1 p-5 " style={{ maxWidth: "550px" }}>
                {/* ------------------------ track box ------------------- */}
                <div>
                  <div className="flex text-black gap-10">
                    <div>
                      <p
                        className="font-sansation font-bold cursor-pointer"
                        onClick={() => setClickLocation(true)}
                      >
                        TRACK ORDER
                      </p>
                      {clickLocation ? (
                        <hr className="w-[7rem] border-2 border-custom-green" />
                      ) : (
                        " "
                      )}
                    </div>
                    <div>
                      <p
                        className="font-sansation font-light cursor-pointer"
                        onClick={() => setClickLocation(false)}
                      >
                        LOCATION
                      </p>
                      {clickLocation ? (
                        ""
                      ) : (
                        <hr className="w-[5rem] border-2 border-custom-green" />
                      )}
                    </div>
                  </div>

                  <div>
                    <hr />
                  </div>
                  {clickLocation ? (
                    <>
                      <p className="text-black pt-3 font-sansation font-bold text-2xl">
                        Track{" "}
                        <span className="font-sansation font-normal">
                          your order through
                        </span>
                      </p>

                      <div className="flex flex-col gap-4 mt-3">
                        <div className="flex cursor-pointer border-2 border-gray-300">
                          <div
                            className={`flex-1  rounded-l-md ${isAwbSelected
                              ? "bg-black text-white"
                              : "bg-white text-black border-custom-gray"
                              }`}
                            onClick={() => handleSelectionClick(true)}
                          >
                            <p className="p-2 text-center font-sansation font-regular">
                              AWB Number
                            </p>
                          </div>
                          {/* <div
                            className={`flex-1 border-2 rounded-r-md ${!isAwbSelected
                              ? "bg-black text-white"
                              : "bg-white text-black border-custom-gray"
                              }`}
                            onClick={() => handleSelectionClick(false)}
                          >
                            <p className="p-2 text-center font-sansation font-regular ">
                              Order / Ref Number
                            </p>
                          </div> */}
                        </div>
                        <form onSubmit={formik.handleSubmit}>
                          <div className="flex flex-col">
                            <div className="flex-1 border-2 border-solid border-gray-300 rounded-md">
                              {isAwbSelected ? (
                                <>
                                  <input
                                    name="trackingId"
                                    placeholder="Tracking ID"
                                    className="border-none outline-none text-black p-2 w-full font-sansation font-regular"
                                    value={formik.values.trackingId}
                                    onChange={(e) => {
                                      formik.handleChange(e);
                                      // reset hasSearched when input is cleared
                                      if (e.target.name === "trackingId" && e.target.value.trim() === "") {
                                        setHasSearched(false);
                                      }
                                    }}
                                    onBlur={formik.handleBlur}
                                  />
                                </>
                              ) : (
                                <>
                                  <input
                                    name="orderId"
                                    placeholder="Order ID"
                                    className="border-none outline-none text-black p-2 w-full font-sansation font-regular"
                                    value={formik.values.orderId}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                  />
                                </>
                              )}
                            </div>
                            {/* Error message outside the input box div */}
                            {isAwbSelected &&
                              (formik.touched.trackingId && formik.errors.trackingId) && (
                                <div className="text-red-500 text-sm mt-1">
                                  Traking Id is required
                                </div>
                              )}
                            {!isAwbSelected &&
                              formik.touched.orderId &&
                              formik.errors.orderId && (
                                <div className="text-red-500 text-sm mt-1">
                                  {formik.errors.orderId}
                                </div>
                              )}
                          </div>
                          <div className="flex justify-center">
                            <div className="mt-3">
                              <ReCAPTCHA
                                sitekey="6Lc9ca4rAAAAAIS9AbQ_0PLhuTbx398CNm7jOAy8"
                                onChange={handleRecaptchaChange}
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className={`${recaptchaToken ? 'opacity-100 cursor-pointer' : 'opacity-25 cursor-not-allowed'} bg-black text-white w-full mt-3 rounded-md flex items-center justify-center p-2  font-sansation font-bold`}
                            onClick={() => handleTrack()}
                            disabled={loading || !recaptchaToken}
                          >
                            {loading ? <ClipLoader color="white" size={18} /> : "Track"}
                          </button>
                        </form>

                        {hasSearched && !loading && (
                          trackData && trackData.length > 0 ? (
                            <div className="max-h-[450px]" style={{ overflowY: "auto" }}>
                              <TrackingCard3 steps={trackData} />
                            </div>
                          ) : (
                            <p className="text-center text-gray-800 mt-0">No data found</p>
                          )
                        )}
                        <hr className="border-t-2" />
                        <p className="text-custom-blue text-center font-sansation font-regular text-sm">
                          {" "}
                          Live tracking updates & extra support on our App
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                          <div className=" border-2 rounded-md cursor-pointer flex justify-center  hover:border-custom-green  ">
                            <GooglePlayButton />
                          </div>
                          <div className="border-2 rounded-md cursor-pointer flex justify-center hover:border-custom-green ">
                            <AppStoreButton />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // <div className="relative">
                    //   <form onSubmit={formik.handleSubmit}>
                    //     <div className="mt-3 flex flex-col">
                    //       <label htmlFor="state" className="form-label">State</label>
                    //       <Select
                    //         value={stateOptions?.find(option => option.value === formik.values.state) || null}
                    //         onChange={selectedOption => {
                    //           formik.setFieldValue('state', selectedOption ? selectedOption.value : '')
                    //           setSelectedState(selectedOption ? selectedOption.value : '')
                    //         }}
                    //         name="state"
                    //         options={stateOptions}
                    //         isSearchable={true}
                    //         placeholder="Select a state..."
                    //         styles={customStyles}
                    //         className="mt-2"
                    //       />
                    //       {formik.errors.state && formik.touched.state && <div className="text-red-500">{formik.errors.state}</div>}
                    //     </div>

                    //     <div className="mt-3 flex flex-col">
                    //       <label htmlFor="city" className="form-label">City</label>
                    //       <Select
                    //         value={cityOptions?.find(option => option.value === formik.values.city) || null}
                    //         onChange={selectedOption => {
                    //           formik.setFieldValue('city', selectedOption ? selectedOption.value : '')
                    //           setSelectedCity(selectedOption ? selectedOption.value : '')
                    //         }}
                    //         name="city"
                    //         options={cityOptions}
                    //         isSearchable={true}
                    //         placeholder="Select a city..."
                    //         styles={customStyles}
                    //         className="mt-2"
                    //       />
                    //       {formik.errors.city && formik.touched.city && <div className="text-red-500">{formik.errors.city}</div>}
                    //     </div>

                    //     <div className="mt-3 flex flex-col">
                    //       <label htmlFor="pincode" className="form-label">Pincode</label>
                    //       <Select
                    //         value={pincodeOptions?.find(option => option.value === formik.values.pincode) || null}
                    //         onChange={selectedOption => {
                    //           formik.setFieldValue('pincode', selectedOption ? selectedOption.value : '')
                    //           setSelectedPincode(selectedOption ? selectedOption.value : '')
                    //         }}
                    //         name="pincode"
                    //         options={pincodeOptions}
                    //         isSearchable={true}
                    //         placeholder="Select a Pincode..."
                    //         styles={customStyles}
                    //         className="mt-2"
                    //       />
                    //       {formik.errors.pincode && formik.touched.pincode && <div className="text-red-500">{formik.errors.pincode}</div>}
                    //     </div>

                    //     <button
                    //       type="submit"
                    //       className="bg-black w-full my-4 text-white rounded-md flex items-center justify-center p-2 cursor-pointer font-sansation font-bold"
                    //     >
                    //       Track
                    //     </button>

                    //   </form>
                    //   {locationData && <div className="grid grid-cols-2 absolute top-50 mt-5 bg-white" style={{minWidth:"600px"}}>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Pincode</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">City</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">State</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Branch</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Dox</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Non-Dox</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">To-Play</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">STD-ODA</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Road Exp</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Road ODA</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Prime</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Prime Plus 12pm</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Reverse-Pickup</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //     <div className="border flex flex-col p-4">
                    //       <p className="font-sansation text-lg">Contact</p>
                    //       <h3 className="bold-sansation text-2xl">678645</h3>
                    //     </div>
                    //   </div>}
                    // </div>
                    <div className="relative">
                      <form onSubmit={formik.handleSubmit} className="relative grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* State Dropdown */}
                        <div className="mt-3 flex flex-col">
                          <label htmlFor="state" className="form-label">State</label>
                          <Select
                            value={stateOptions?.find(option => option.value === formik.values.state) || null}
                            onChange={selectedOption => {
                              formik.setFieldValue('state', selectedOption ? selectedOption.value : '');
                              setSelectedState(selectedOption?.value)
                            }}
                            name="state"
                            options={stateOptions}
                            isSearchable={true}
                            placeholder="Select a state..."
                            styles={customStyles}
                            className="mt-2"
                            isClearable={true}
                          />
                          {formik.errors.state && formik.touched.state && (
                            <div className="text-red-500">{formik.errors.state}</div>
                          )}
                        </div>

                        {/* City Dropdown */}
                        <div className="mt-3 flex flex-col">
                          <label htmlFor="city" className="form-label">City</label>
                          <Select
                            value={cityOptions?.find(option => option.value === formik.values.city) || null}
                            onChange={selectedOption => {
                              formik.setFieldValue('city', selectedOption ? selectedOption.value : '');
                              setSelectedCity(selectedOption?.value)
                            }}
                            name="city"
                            options={cityOptions}
                            isSearchable={true}
                            placeholder="Select a city..."
                            styles={customStyles}
                            className="mt-2"
                            isClearable={true}
                          />
                          {formik.errors.city && formik.touched.city && (
                            <div className="text-red-500">{formik.errors.city}</div>
                          )}
                        </div>

                        {/* Pincode Dropdown */}
                        <div className="mt-3 flex flex-col">
                          <label htmlFor="pincode" className="form-label">Pincode</label>
                          <Select
                            value={pincodeOptions?.find(option => option.value === formik.values.pincode) || null}
                            onChange={selectedOption => {
                              formik.setFieldValue('pincode', selectedOption ? selectedOption.value : '');
                              setSelectedPincode(selectedOption?.value)
                            }}
                            name="pincode"
                            options={pincodeOptions}
                            isSearchable={true}
                            placeholder="Select a Pincode..."
                            styles={customStyles}
                            className="mt-2"
                            isClearable={true}
                          />
                          {formik.errors.pincode && formik.touched.pincode && (
                            <div className="text-red-500">{formik.errors.pincode}</div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className={`bg-black w-full mt-11 ${locationLoader ? "cursor-not-allowed" : "cursor-pointer"} text-white rounded-md flex items-center justify-center h-[45px] p-2  font-sansation font-bold`}
                          onClick={() => setIsVisible(true)}
                        >
                          {locationLoader ? <ClipLoader size={18} color="white" /> : 'Track'}
                        </button>
                      </form>

                      {/* Content Div with Transition */}
                      <div
                        className={`mt-6 bg-white grid grid-cols-2 sm:grid-cols-4 border transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
                          }`}
                        style={{ minWidth: '100%', overflow: 'hidden' }}
                      >
                        {locationData && (
                          <>
                            <div className="border flex flex-col p-2">
                              <p className="font-sansation text-sm">Pincode</p>
                              <h3 className="bold-sansation text-md">{locationData?.pincode || '-'}</h3>
                            </div>
                            <div className="border flex flex-col p-2">
                              <p className="font-sansation text-sm">City</p>
                              <h3 className="bold-sansation text-md">{locationData?.city || '-'}</h3>
                            </div>
                            <div className="border flex flex-col p-2">
                              <p className="font-sansation text-sm">State</p>
                              <h3 className="bold-sansation text-md">{locationData?.state || '-'}</h3>
                            </div>
                            <div className="border flex flex-col p-2">
                              <p className="font-sansation text-sm">Branch</p>
                              <h3 className="bold-sansation text-md">{locationData?.branch || '-'}</h3>
                            </div>
                            <div className="border p-2">
                              <span className="font-sansation text-sm">{locationData?.Dox ? <TiTick style={{ display: "inline" }} className="text-2xl text-custom-green" /> : <IoClose style={{ display: "inline" }} className="text-2xl text-red-500" />} Dox</span>
                            </div>
                            <div className="border p-2">
                              <span className="font-sansation text-sm">{locationData?.NonDox ? <TiTick style={{ display: "inline" }} className="text-2xl text-custom-green" /> : <IoClose style={{ display: "inline" }} className="text-2xl text-red-500" />} Non-Dox</span>
                            </div>
                            <div className="border p-2">
                              <span className="font-sansation text-sm">{locationData?.ToPay ? <TiTick style={{ display: "inline" }} className="text-2xl text-custom-green" /> : <IoClose style={{ display: "inline" }} className="text-2xl text-red-500" />} To-Pay</span>
                            </div>
                            <div className="border p-2">
                              <span className="font-sansation text-sm">{locationData?.stdoda ? <TiTick style={{ display: "inline" }} className="text-2xl text-custom-green" /> : <IoClose style={{ display: "inline" }} className="text-2xl text-red-500" />} STD-ODA</span>
                            </div>
                            <div className="border p-2">
                              <span className="font-sansation text-sm">{locationData?.roadexp ? <TiTick style={{ display: "inline" }} className="text-2xl text-custom-green" /> : <IoClose style={{ display: "inline" }} className="text-2xl text-red-500" />} Road Exp</span>
                            </div>
                            <div className="border p-2">
                              <span className="font-sansation text-sm">{locationData?.roadoda ? <TiTick style={{ display: "inline" }} className="text-2xl text-custom-green" /> : <IoClose style={{ display: "inline" }} className="text-2xl text-red-500" />} Road ODA</span>
                            </div>
                            <div className="border p-2">
                              <span className="font-sansation text-sm">{locationData?.reversePickup ? <TiTick style={{ display: "inline" }} className="text-2xl text-custom-green" /> : <IoClose style={{ display: "inline" }} className="text-2xl text-red-500" />} Reverse-Pickup</span>
                            </div>
                            <div className="border flex flex-col p-2">
                              <p className="font-sansation text-sm">Contact</p>
                              <h3 className="bold-sansation text-md">{locationData?.contact || '-'}</h3>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* ------------------------ track box end ------------------- */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <About />

      <Logistics_Services />

      <We_Offer />

      <Working_Process />
    </>
  );
};

export default LandingPage;
