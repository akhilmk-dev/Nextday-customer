import React, { useContext, useEffect, useState } from 'react'
import { useGlobalFormik } from '../utils/custom-hooks/formik-hook/useGlobalFormik';
import { locationFinderInitialValues, locationFinderValidationSchema } from '../utils/validation-schema/auth-schema/authSchema';
import toast from 'react-hot-toast';
import Select from 'react-select';
import request from '../utils/request';
import { TiTick } from "react-icons/ti";
import { IoClose } from "react-icons/io5";
import { myContext } from '../utils/context_api/context';
import ReCAPTCHA from 'react-google-recaptcha';
import GooglePlayButton from '../components/button/GooglePlayButton';
import AppStoreButton from '../components/button/AppstoreButton';
import TrackingCard3 from '../components/card/TrackingCard3';
import ClipLoader from 'react-spinners/ClipLoader';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/button/Button';
import { BASE_URL } from '../../config';
import ImageModal from '../components/Modals/ImageModal';

const LocationFinder = () => {
    const [isAwbSelected, setIsAwbSelected] = useState(true);
    const [isOrderSelect, setIsOrderSelect] = useState(false);
    const [clickLocation, setClickLocation] = useState(true);
    const [countryInfo, setCountryInfo] = useState([]);
    const [selectedState, setSelectedState] = useState()
    const [selectedCity, setSelectedCity] = useState();
    const [pincodeList, setPincodeList] = useState([])
    const [selectedPincode, setSelectedPincode] = useState()
    const [locationData, setLocationData] = useState()
    const [isVisible, setIsVisible] = useState(false);
    const [trackData, setTrackData] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [locationLoader, setLocationLoader] = useState(false);
    const [check, setCheck] = useState(false);
    const { login } = useContext(myContext);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [searchParams] = useSearchParams();
    const [podImage, setPodImage] = useState();
    const [awb, setAwb] = useState();
    const id = searchParams.get('id');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const formik = useGlobalFormik(locationFinderInitialValues, locationFinderValidationSchema,
        (values) => {
            setLocationLoader(true)
            request({
                url: `V1/service-availability?stateId=${selectedState}&cityId=${selectedCity}&pincode=${selectedPincode}`,
                method: "GET",
            }).then((response) => {
                setLocationData(response?.data[0]);
                setLocationLoader(false);
            }).catch((error) => {
                if (error.response.status == 500) {
                    toast.dismiss();
                    toast.error(err.response.data.message)
                }
                setLocationLoader(false);
            })
        });
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
        if (id) {
            formik.setFieldValue("trackingId", id);
            handleTrack();
        }
    }, [id])

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

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const handleTrack = () => {
        setTrackData([])
        setCheck(true)
        if (!formik.values?.trackingId && !id) {
            formik.setFieldTouched('trackingId', true);
            return;
        }
        setHasSearched(true);
        if (isAwbSelected) {
            setLoading(true)
            request({
                url: `V1/getTrackingDetailsByAwb?awblist=${formik.values?.trackingId || id}`,
                method: "GET",
            }).then((response) => {
                setTrackData(JSON.parse(response?.data[0]?.trackingResult)[0]?.tracking);
                setAwb(JSON.parse(response?.data[0]?.trackingResult)[0]?.awbnumber);
                setPodImage(JSON.parse(response?.data[0]?.trackingResult)[0]?.podFile || '');
                setLoading(false)
            }).catch((error) => {
                setLoading(false)
                if (error.response.status == 500) {
                    toast.dismiss();
                    toast.error(error.response.data.message)
                }
            })
        }
    }

    return (
        <>
            <ImageModal setIsImageModalOpen={setIsImageModalOpen} isImageModalOpen={isImageModalOpen} path={podImage} />
            <div className='my-8'>
                <div className="mx-3 lg:mx-0 flex justify-center" >
                    <div className="bg-white border-2 border-solid shadow-md rounded-md flex-1 p-5 " style={{ maxWidth: "750px" }}>
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
                                                    (!formik.values.trackingId && check) && (
                                                        <div className="text-red-500 text-sm mt-1">
                                                            Tracking Id is required
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
                                                className={`${recaptchaToken ? 'opacity-100 cursor-pointer' : 'opacity-25 cursor-not-allowed'} bg-black text-white w-full mt-3 rounded-md flex items-center justify-center p-2 font-sansation font-bold`}
                                                onClick={() => handleTrack()}
                                                disabled={loading || !recaptchaToken}
                                            >
                                                {loading ? <ClipLoader color="white" size={18} /> : "Track"}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (

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
                                            className={`bg-black w-full mt-11 text-white rounded-md flex items-center justify-center h-[45px] p-2 ${locationLoader ? 'cursor-not-allowed' : 'cursor-pointer'} font-sansation font-bold`}
                                            onClick={() => setIsVisible(true)}
                                            disabled={locationLoader}
                                        >
                                            {locationLoader ? <ClipLoader color="white" size={18} /> : "Track"}
                                        </button>
                                    </form>

                                    {/* Content Div with Transition */}
                                    <div
                                        className={` mt-6 bg-white grid grid-cols-2 sm:grid-cols-4 border transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
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
                                                    <h3 className="bold-sansation text-md">{locationData?.state || '-'}45</h3>
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
                {(trackData && !loading && clickLocation) && <div className=" flex my-4 py-4 shadow-md border justify-start mx-auto" style={{ maxWidth: "750px" }}>
                    <div className='pl-3 w-full'>
                        <div className='flex justify-between pe-3 mb-3'>
                            {awb && <h2 className="text-xl font-bold">#{awb}</h2>}
                            {podImage && <button className='bg-custom-green text-white flex items-center  justify-center rounded-md px-2 font-sansation font-regular ' onClick={() => { setIsImageModalOpen(true) }}>POD</button>}
                        </div>

                        <h3 className=' text-2xl mb-3'>Tracking Status</h3>
                        {hasSearched && !loading && (
                            trackData && trackData.length > 0 ? (
                                <div>
                                    <TrackingCard3 steps={trackData} />
                                </div>
                            ) : (
                                <div className='w-full text-center' style={{ width: "100%" }}> <p className=" text-gray-800 mt-0">No data found</p></div>
                            )
                        )}
                    </div>
                </div>}
            </div>
        </>
    )
}

export default LocationFinder;