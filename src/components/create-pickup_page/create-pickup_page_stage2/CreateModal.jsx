import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import CustomInputField from "../../input-field/CustomInput";
import Button2 from "../../button/Button2";
import Button from "../../button/Button";
import { AiFillHome } from "react-icons/ai";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import mapImage from "../../../images/mapimage2.png";
import Select from 'react-select';
import debounce from 'lodash/debounce';

import {
  emailValidation,
  nameValidation,
  phoneValidation,
  pincodeValidation,
  addressValidation,
  addressTypeValidation,
  cityValidation,
  stateValidation,
  countryValidation,
  locationValidation,
} from "../../../utils/validation-schema/commonValidation";
import { useFormik } from "formik";
import * as Yup from "yup";
import request from '../../../utils/request'
import toast from "react-hot-toast";
import { myContext } from "../../../utils/context_api/context";
import { IoMdClose } from "react-icons/io";

const CreateModal = ({ heading, isOpen, onClose, fetchAddressList }) => {
  const [countryInfo, setCountryInfo] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState();
  const [state, setState] = useState();
  const [city, setCity] = useState();
  const [errorMap, setErrorMap] = useState({});
  const [map, setMap] = useState(null);
  const [receivers, setReceivers] = useState([
    { name: "", phone: "" },
  ]); // Initialize with one receiver
  const { addressList, setAddressList } = useContext(myContext);
  const [searchInput, setSearchInput] = useState('');
  const [options, setOptions] = useState([]); // Initially, no options

  // Debounced API call to fetch pincode options
  const fetchOptions = useCallback(
    debounce(async (inputValue) => {
      if (inputValue) {
        request({
          url: `V1/searchpincode?searchTerm=${searchInput}`,
          method: "GET",
        }).then((response) => {
          setOptions(response?.data?.map(item => ({
            label: item?.pincode,
            value: item?.pincode,
            cityName: item?.cityName,
            cityId: item?.cityId,
            stateName: item?.stateName,
            stateId: item?.stateId,
            countryName: item?.countryName,
            countryId: item?.countryId
          })))
        }).catch((err) => {
          if (err.response.status == 500) {
            toast.dismiss();
            toast.error(err.response.data.message)
          }
        })
      }
    }, 500), // Debounced by 500ms to limit the API calls
    []
  );

  // Trigger the debounced API call when input changes
  const handlePincodeInputChange = (newValue) => {
    setSearchInput(newValue); // Update search input value
    fetchOptions(newValue); // Trigger API call
  };

  // useEffect(() => {
  //   request({
  //     url: "V1/locations",
  //     method: "GET"
  //   }).then((response) => {
  //     setCountryInfo(response.data)
  //   }).catch((err) => {
  //     if (err.response.status == 500) {
  //       toast.error(err.response.data.message)
  //     }
  //   })
  // }, [])

  // Function to handle which address is selected
  // const handleClick = (index) => {
  //   setActiveIndex(index);
  //   formik.setFieldValue(
  //     "addressType",
  //     index === 0 ? "Home" : index === 1 ? "Office" : "Friend's House"
  //   );
  // };

  const center = {
    lat: 10.850516,
    lng: 76.271080
  };

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  // formik validation
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phoneNumber: "",
      pincode: "",
      country: "",
      state: "",
      city: "",
      gstNumber: "",
      addressLine1: "",
      addressLine2: "",
      addressType: "",
      addressLabel: "",
      receivers: receivers,
    },
    validationSchema: Yup.object({
      name: nameValidation,
      email: emailValidation,
      phoneNumber: phoneValidation,
      pincode: pincodeValidation,
      addressLine1: addressValidation,
      addressLine2: addressValidation,
      addressLabel: addressTypeValidation,
      location: locationValidation,
      city: cityValidation,
      state: stateValidation,
      country: countryValidation,
    }),
    onSubmit: (values, { setSubmitting }) => {
      setErrorMap({})
      // Filter out empty receivers
      // Filter out any empty receiver entries beyond the first one
      request({
        url: "V1/customer/address",
        method: "POST",
        data: {
          gstNumber: values?.gstNumber,
          fullName: values?.name,
          emailId: values?.email,
          phoneNo: values?.phoneNumber,
          addressLabel: values?.addressLabel,
          addressType: "'",  // Example value
          addressLine1: values?.addressLine1,  // Example value
          addressLine2: values?.addressLine2,
          countryId: values?.country,  // Example value
          stateId: values?.state,  // Example value
          cityId: values?.city,  // Example value
          pincodeId: values?.pincode,  // Example value
          latitude: values?.latitude,  // Example value
          longitude: values?.longitude,  // Example value
          possibleReceivers: receivers
        }
      }).then((response) => {
        toast.dismiss();
        toast.success(response.message)
        fetchAddressList(setAddressList);
        onClose(false)
      }).catch((err) => {
        if (err.response.status === 400) {
          const errormap = err.response.data.errors.reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
          }, {});
          setErrorMap(errormap);
        }
        if (err.response.status == 500) {
          toast.dismiss();
          toast.error(err.response.data.message)
        }
      })
    },
  });

  // Handle adding more receivers
  const handleAddMore = () => {
    setReceivers([...receivers, { name: "", phone: "" }]);
  };

  const handleRemoveReceiver = (index) => {
    const updatedReceivers = [...receivers];
    updatedReceivers.splice(index, 1); // Remove the receiver at the given index
    setReceivers(updatedReceivers); // Update the state
  };

  // Handle Receivers' Input Change
  const handleReceiverChange = (index, event) => {
    const { name, value } = event.target;
    const updatedReceivers = [...receivers];
    updatedReceivers[index][name] = value;
    setReceivers(updatedReceivers);
    formik.setFieldValue("receivers", updatedReceivers);
  };

  const [marker, setMarker] = useState()
  const autocompleteRef = useRef(null);
  const [address, setAddress] = useState('');
  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) {
      console.error('Returned place contains no geometry');
      return;
    } else {
      formik.setFieldValue('latitude', place.geometry.location.lat());
      formik.setFieldValue('longitude', place.geometry.location.lng())
      formik.setFieldValue('location', place.formatted_address)
    }

    const newCenter = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    setMarker(newCenter);
    setAddress(place.formatted_address);
    map.panTo(newCenter);

  };

  const onMapClick = (event) => {
    const latLng = event.latLng;
    const newCenter = {
      lat: latLng.lat(),
      lng: latLng.lng()
    };

    setMarker(newCenter);
    map.panTo(newCenter);

    // Reverse geocoding to get the address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: newCenter }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
        formik.setFieldValue('location', results[0].formatted_address);
        formik.setFieldValue('latitude', newCenter.lat);
        formik.setFieldValue('longitude', newCenter.lng);
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  const onMarkerDragEnd = (e) => {
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarker(newPosition);
    formik.setFieldValue('latitude', newPosition.lat);
    formik.setFieldValue('longitude', newPosition.lng);
  };

  const mapContainerStyle = {
    height: '200px',
    width: '100%'
  };

  // useEffect(() => {
  //   if (selectedCity) {
  //     request({
  //       url: `V1/searchpincode?searchTerm=${searchQuery}`,
  //       method: "GET",
  //     }).then((response) => {
  //       setPincodeList(response?.data)
  //     }).catch((err) => {
  //       if (err.response.status == 500) {
  //         toast.error(err.response.data.message)
  //       }
  //     })
  //   }
  // }, [selectedCity])



  const customStyles = {
    input: (provided) => ({
      ...provided,
      padding: '6px',
    }),
  }

  return (
    <Dialog open={isOpen} onClose={() => onClose(false)} className="relative " style={{ zIndex: 999 }}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"

      />
      <form onSubmit={formik.handleSubmit} style={{ zIndex: 99999 }}>
        <div className="fixed inset-0 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:sm:max-w-[50rem]"
            >
              <button
                type="button"
                onClick={() => onClose(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <IoMdClose className="text-2xl" />
              </button>
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pt-8 sm:pb-8">
                <h5 className="text-xl font-sansation">{heading}</h5>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
                  <div>
                    <CustomInputField
                      type="text"
                      name="name"
                      placeholder="Name"
                      title="Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.name}
                      touched={formik.touched.name}
                      isMandatory={true}
                    />
                    <span id="fullName" className="text-red-500 mt-1 text-sm">
                      {errorMap['fullName']}
                    </span>
                    <CustomInputField
                      type="number"
                      name="phoneNumber"
                      placeholder="Phone number"
                      title="Phone Number"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.phoneNumber}
                      touched={formik.touched.phoneNumber}
                      mobile={true}
                      isMandatory={true}
                    />
                    <span id="phoneNo" className="text-red-500 mt-1 text-sm">
                      {errorMap['phoneNo']}
                    </span>
                    {/* <div className="mt-3">
                      <h5 className="bold-sansation">Select Address Type</h5>
                      <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 py-2 gap-2 font-sansation">
                        <div
                          className={`flex items-center justify-center border rounded-md gap-1 p-1 cursor-pointer ${activeIndex === 0
                            ? "text-custom-light-green"
                            : "text-[#7C7C7C]"
                            }`}
                          onClick={() => handleClick(0)}
                        >
                          <AiFillHome className="text-xl" />
                          <p>Home</p>
                        </div>

                        <div
                          className={`flex items-center justify-center border rounded-md gap-1 p-1 cursor-pointer ${activeIndex === 1
                            ? "text-custom-light-green"
                            : "text-[#7C7C7C]"
                            }`}
                          onClick={() => handleClick(1)}
                        >
                          <HiOutlineBuildingOffice2 className="text-xl" />
                          <p>Office</p>
                        </div>

                        <div
                          className={`lg:col-span-2 flex items-center justify-center border rounded-md gap-1 p-1 cursor-pointer ${activeIndex === 2
                            ? "text-custom-light-green"
                            : "text-[#7C7C7C]"
                            }`}
                          onClick={() => handleClick(2)}
                        >
                          <AiFillHome className="text-xl" />
                          <p>Friend's House</p>
                        </div>
                      </div>

                      {formik.errors.addressType &&
                        formik.touched.addressType && (
                          <div className="text-red-500 mt-1 text-sm">
                            {formik.errors.addressType}
                          </div>
                        )}
                    </div> */}
                    {/* <div className="mt-3">
                      <label htmlFor="country" className="form-label">country</label>
                      <Select
                        value={countryOptions?.find(option => option.value === formik.values.country) || null}
                        onChange={selectedOption => {
                          formik.setFieldValue('country', selectedOption ? selectedOption?.value : '')
                          setSelectedCountry(selectedOption?.value)
                        }}
                        name="country"
                        options={countryOptions}
                        isSearchable={true}
                        placeholder="Select a country..."
                        styles={customStyles}
                        className="mt-2"
                      />
                      {formik.errors.country && formik.touched.country && <div className="text-red-500 mt-1 text-sm">{formik.errors.country}</div>}
                    </div> */}
                    <span id="countryId" className="text-red-500 mt-1 text-sm">
                      {errorMap['countryId']}
                    </span>

                    <div className="mt-3">
                      <label htmlFor="pincode" className="form-label">Pincode</label>
                      <Select
                        value={options?.find(option => option.value == formik.values.pincode) || null} // Set selected value based on formik
                        onChange={selectedOption => {
                          formik.setFieldValue('pincode', selectedOption ? selectedOption.value : '');
                          formik.setFieldValue('state', selectedOption?.stateId);
                          formik.setFieldValue('city', selectedOption?.cityId);
                          formik.setFieldValue('country', selectedOption?.countryId);
                          setState(selectedOption?.stateName);
                          setCity(selectedOption?.cityName);
                          setSelectedPincode(selectedOption ? selectedOption.value : ''); // Optionally handle selected option
                        }}
                        name="pincode"
                        options={options} // Display options fetched from API
                        isSearchable={true} // Allow searching
                        placeholder="Select a Pincode..."
                        styles={customStyles}
                        className="mt-2"
                        isClearable={true}
                        onInputChange={handlePincodeInputChange} // Trigger API call on input change
                        inputValue={searchInput} // Manage input value for search
                      />
                      {formik.errors.pincode && formik.touched.pincode && <div className="text-red-500 mt-1 text-sm">{formik.errors.pincode}</div>}
                      <span id="pincodeId" className="text-red-500 mt-1 text-sm">
                        {errorMap['pincodeId']}
                      </span>
                    </div>
                    <CustomInputField
                      type="text"
                      name="state"
                      placeholder="State"
                      title="State"
                      value={state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.state}
                      touched={formik.touched.state}
                      disabled={true}
                      isMandatory={true}
                    />
                    {/* {formik.errors.state && formik.touched.state && <div className="text-red-500 mt-1 text-sm">{formik.errors.state}</div>} */}

                    {(!formik.errors.state && !formik.touched.state && errorMap['stateId']) && <span id="stateId" className="text-red-500 mt-1 text-sm">
                      {errorMap['stateId']}
                    </span>}
                    <CustomInputField
                      type="text"
                      name="city"
                      placeholder="City"
                      title="City"
                      value={city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.city}
                      touched={formik.touched.city}
                      disabled={true}
                      isMandatory={true}
                    />
                    {/* {formik.errors.city && formik.touched.city && <div className="text-red-500 mt-1 text-sm">{formik.errors.city}</div>} */}

                    {(!formik.errors.city && !formik.touched.city) && <span id="cityId" className="text-red-500 mt-1 text-sm">
                      {errorMap['cityId']}
                    </span>}

                  

                    <CustomInputField
                      type="text"
                      name="addressLabel"
                      placeholder="Enter Address Label"
                      title="Address Label"
                      value={formik.values.addressLabel}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.addressLabel}
                      touched={formik.touched.addressLabel}
                      isMandatory={true}
                    />
                    <span id="addressLabel" className="text-red-500 mt-1 text-sm">
                      {errorMap['addressLabel']}
                    </span>
                    {/* <CustomInputField
                      type="text"
                      name="addressType"
                      placeholder="Enter Address Type"
                      title="Address Type"
                      value={formik.values.addressType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.addressType}
                      touched={formik.touched.addressType}
                    />
                    <span id="addressType" className="text-red-500">
                      {errorMap['addressType']}
                    </span> */}
                    <div className="mt-3">
                      <LoadScript googleMapsApiKey={'AIzaSyD_M5QYY_seLbsWsWtVtZRSpCFYUxjRoeI'} libraries={['places']}>
                        <label htmlFor="location" className="form-label ">Location <span className="text-red-500"> *</span></label>
                        <Autocomplete
                          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                          onPlaceChanged={onPlaceChanged}
                        >
                          <input id="location" type="text" className=" outline-none w-full font-sansation font-regular text-sm  h-[45px] pl-3 border border-gray-300 rounded-lg mb-2" name="location" value={formik.values.location} onChange={formik.handleChange} placeholder="Enter office location" />

                        </Autocomplete>
                        <div className="relative">
                          <GoogleMap
                            id="map"
                            mapContainerStyle={mapContainerStyle}
                            zoom={15}
                            center={marker || center}
                            onLoad={onLoad}
                            onClick={onMapClick}
                          >
                            {marker && <Marker position={marker} draggable={true}
                              onDragEnd={onMarkerDragEnd} />}
                          </GoogleMap>
                          <input
                            type="text"
                            className="absolute bottom-4 left-1/3 transform -translate-x-1/2 p-2 outline-none border bg-white rounded shadow-md w-7/12"
                            value={address}
                            readOnly
                            placeholder="Selected location... "
                          />
                        </div>

                      </LoadScript>
                      {formik.errors.location && <div className="text-red-500 mt-1 text-sm">{formik.values.location ? "" : formik.errors.location}</div>}
                    </div>
                  </div>

                  <div>

                    <span id="postalCode" className="text-red-500 mt-1 text-sm">
                      {errorMap['postalCode']}
                    </span>
                    <CustomInputField
                      type="email"
                      name="email"
                      placeholder="Email Id"
                      title="Email ID"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.email}
                      touched={formik.touched.email}
                      isMandatory={true}
                    />
                    <span id="emailId" className="text-red-500 mt-1 text-sm">
                      {errorMap['emailId']}
                    </span>
                    <CustomInputField
                      type="text"
                      name="addressLine1"
                      placeholder="Address 1"
                      rows={3}
                      title="Address 1"
                      value={formik.values.addressLine1}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.addressLine1}
                      touched={formik.touched.addressLine1}
                      isMandatory={true}
                    />
                    <span id="addressLine1" className="text-red-500 mt-1 text-sm">
                      {errorMap['addressLine1']}
                    </span>
                    <CustomInputField
                      type="text"
                      name="addressLine2"
                      placeholder="Address 2"
                      rows={3}
                      title="Address 2"
                      value={formik.values.addressLine2}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.addressLine2}
                      touched={formik.touched.addressLine2}
                      isMandatory={true}
                    />
                    <span id="addressLine2" className="text-red-500 mt-1 text-sm">
                      {errorMap['addressLine2']}
                    </span>

                    <CustomInputField
                      type="text"
                      name="gstNumber"
                      placeholder="Enter gst number"
                      title="GST Number"
                      value={formik.values.gstNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.gstNumber}
                      touched={formik.touched.gstNumber}
                      isMandatory={true}
                    />

                    <span id="gstNumber" className="text-red-500 mt-1 text-sm">
                      {errorMap['gstNumber']}
                    </span>

                    <h5 className="font-sansation text-lg mt-5">
                      Possible Receivers
                    </h5>

                    {receivers.map((receiver, index) => (
                      <div className="pt-3" key={index}>
                        <label htmlFor="" className="">Name & Phone Number</label>
                        <div className="grid grid-cols-3 gap-1 items-center justify-center" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                          <div>
                            <CustomInputField
                              type="text"
                              name={`name`}
                              placeholder="Enter Name"
                              value={receiver.name}
                              onChange={(event) => handleReceiverChange(index, event)}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div>
                            <CustomInputField
                              type="text"
                              name={`phone`}
                              placeholder="Enter Phone Number"
                              value={receiver.phone}
                              onChange={(event) => handleReceiverChange(index, event)}
                              onBlur={formik.handleBlur}
                              mobile={true}
                            />
                          </div>
                          {/* Show "Remove" button only if there's more than one receiver */}
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveReceiver(index)}
                              className="text-red-500 flex py-3 mt-4"
                            >
                              <IoMdClose className="text-2xl" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add More Button */}
                    <div className="flex justify-end mt-4">
                      <Button2
                        type="button"
                        buttonText="Add More"
                        onClick={handleAddMore}
                        className="w-[7rem] h-[2rem] text-custom-green border-custom-green hover:border-custom-gray hover:bg-[#CAFFE5]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <Button
                    type="submit"
                    buttonText="Submit"
                    className="w-1/4 mt-5"
                    isLoading={formik.isSubmitting}
                  />
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateModal;