



import React, { useEffect } from "react";
import Dropdown from "../../input-field/Dropdown";
import { useState } from "react";
import CustomInputField from "../../input-field/CustomInput";
import ToggleButton from "../../button/ToggleButton";
import { MdInfo } from "react-icons/md";
import map from "../../../images/map.png";
import InputfieldWithIcon from "../../input-field/InputfieldWithIcon";
import { PiClockThin } from "react-icons/pi";
import calenderIcon from "../../../images/calende-icon.png";
import PickupSection2 from "./PickupSection2";
import Select from "react-select";
import { getTodayDate } from "../../../utils/helpers";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { pincodeValidation } from "../../../utils/validation/Validation";

const PickupSection1 = ({ formik, setIsReversePickup, isReversePickup, isAppoinment, setIsAppointment, isToPay, setIsToPay }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [minScheduleTo, setMinScheduleTo] = useState('');
  const [maxScheduleTo, setMaxScheduleTo] = useState('');

  // useEffect(() => {
  //   if (formik?.values?.pickupScheduleFrom) {
  //     const pickupFromDate = new Date(formik.values.pickupScheduleFrom);
  //     // Set minScheduleTo to the same date with time 00:00
  //     const minTime = pickupFromDate.toISOString().slice(0, 16);
  //     setMinScheduleTo(minTime);

  //     // Set maxScheduleTo to the same date with time 23:59
  //     const maxTime = `${pickupFromDate.toISOString().slice(0, 10)}T23:59`;
  //     setMaxScheduleTo(maxTime);
  //   }
  // }, [formik?.values?.pickupScheduleFrom]);

  useEffect(() => {
    if (formik?.values?.pickupScheduleFrom) {
      const pickupFromDate = new Date(formik.values.pickupScheduleFrom);

      // Format to match datetime-local input (yyyy-MM-ddTHH:mm)
      const formatDateTimeLocal = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Months are 0-indexed
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Set minScheduleTo = pickup time selected
      setMinScheduleTo(formatDateTimeLocal(pickupFromDate));

      // Set maxScheduleTo = same date at 23:59
      const endOfDay = new Date(pickupFromDate);
      endOfDay.setHours(23);
      endOfDay.setMinutes(59);
      setMaxScheduleTo(formatDateTimeLocal(endOfDay));
    }
  }, [formik?.values?.pickupScheduleFrom]);


  // function for selection button
  const options = [
    { value: "road", label: "Surface" },
    // { value: "water", label: "Water" },
    // { value: "air", label: "Air" },
  ];

  // function for toggle button
  const handleToggle = () => {
    setIsToPay((prev) => !prev);
  };

  const handleReversePickup = () => {
    setIsReversePickup((prev) => !prev)
  }
  const handleIsAppoinment = () => {
    setIsAppointment((prev) => !prev)
  }

  const options2 = [
    // { value: "dox", label: "Dox" },
    { value: "nondox", label: "Non Dox" }
  ];

  return (
    <>
      {/* -------------------------------------- main container div --------------------------------------- */}
      <div className="container mx-auto  px-3">

        {/* selection input field div*/}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 p-4 ">
          <Dropdown
            title="Mode Type"
            options={options}
            placeholder="Select"
            name="modeType"
            value={options.find(
              (option) => option.value === 'road'
            )}
            onChange={(option) =>
              formik.setFieldValue("modeType", option.value)
            }
            onBlur={formik.handleBlur}
            error={formik.errors.modeType}
            touched={formik.touched.modeType}
            isMandatory={true}
          />
          <div className="pt-3">
            <label htmlFor="pickupScheduleFrom" className="font-sansation">Pickup Shedule From<span className="text-red-500"> *</span></label>
            <input type="datetime-local" name="pickupScheduleFrom" className="p-[0.535rem] mt-2 w-full border border-gray-300 rounded-lg "
              min={getTodayDate()}
              value={formik?.values?.pickupScheduleFrom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {/* {formik?.errors?.pickupScheduleFrom && <span className="text-red-600 text-sm">{formik.errors.pickupScheduleFrom}</span>} */}
            {formik.touched.pickupScheduleFrom && formik.errors.pickupScheduleFrom && (
              <span className="text-red-600 text-sm">{formik.errors.pickupScheduleFrom}</span>
            )}

          </div>
          <div className="pt-3">
            <label htmlFor="pickupScheduleTo" className="font-sansation">Pickup Shedule To<span className="text-red-500"> *</span></label>
            <input type="datetime-local" name="pickupScheduleTo" className="p-[0.535rem] mt-2 w-full border border-gray-300 rounded-lg "
              value={formik?.values?.pickupScheduleTo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min={minScheduleTo} // Prevent selecting earlier times
              max={maxScheduleTo} />
            {/* {formik?.errors?.pickupScheduleTo && <span className="text-red-600 text-sm">{formik.errors.pickupScheduleTo}</span>} */}
            {formik.touched.pickupScheduleTo && formik.errors.pickupScheduleTo && (
              <span className="text-red-600 text-sm">{formik.errors.pickupScheduleTo}</span>
            )}

          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="items-center flex mt-3 mx-5">
            <div>
              <div className="flex gap-2 relative">
                <h5 className="bold-sansation whitespace-nowrap">To Pay</h5>
                <div className="group ">
                  <MdInfo className="text-[#FFE603] " />
                  {/* display text when hovering over the info icon */}
                  <div className="absolute hidden group-hover:block bg-[#9A9A9A] pt-3 text-custom-white text-sm px-2  py-1 rounded-md w-48 top-1/2 transform -translate-y-1/2 mx-8 z-10">
                    Payment will be collected from the consignee
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2">
                      <svg
                        className="w-4 h-10 text-[#9A9A9A]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* display text when hovering over the info icon end */}
                </div>
              </div>
              <ToggleButton
                checked={isToPay}
                onChange={handleToggle}
                className="my-checkbox"
                inputClassName="my-input"
                toggleClassName="my-toggle"
              />
            </div>
          </div>
          <div className="items-center flex mt-3 mx-5">
            <div>
              <div className="flex gap-2 relative">
                <h5 className="bold-sansation whitespace-nowrap">Reverse Pickup</h5>
                <div className="group ">
                  <MdInfo className="text-[#FFE603]" />
                  {/* display text when hovering over the info icon */}
                  <div className="absolute hidden group-hover:block bg-[#9A9A9A] pt-3 text-custom-white text-sm px-2  py-1 rounded-md w-48 top-1/2 transform -translate-y-1/2 mx-8 z-10">
                    Enable reverse pickup
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2">
                      <svg
                        className="w-4 h-10 text-[#9A9A9A]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* display text when hovering over the info icon end */}
                </div>
              </div>
              <ToggleButton
                checked={isReversePickup}
                onChange={handleReversePickup}
                className="my-checkbox"
                inputClassName="my-input"
                toggleClassName="my-toggle"
              />
            </div>
          </div>
          <div className="items-center flex mt-3 mx-5">
            <div>
              <div className="flex gap-2 relative">
                <h5 className="bold-sansation whitespace-nowrap">Is appointment delivery</h5>
                <div className="group ">
                  <MdInfo className="text-[#FFE603]" />
                  {/* display text when hovering over the info icon */}
                  <div className="absolute hidden group-hover:block bg-[#9A9A9A] pt-3 text-custom-white text-sm px-2  py-1 rounded-md w-48 top-1/2 transform -translate-y-1/2 mx-8 z-10">
                    Enable 'Appointment Delivery' (Extra charge applies)
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2">
                      <svg
                        className="w-4 h-10 text-[#9A9A9A]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* display text when hovering over the info icon end */}
                </div>
              </div>
              <ToggleButton
                checked={isAppoinment}
                onChange={handleIsAppoinment}
                className="my-checkbox"
                inputClassName="my-input"
                toggleClassName="my-toggle"
              />
            </div>
          </div>
        </div>
        {/* selection input field div end*/}

        {/* input field with toggle section */}
        <div className="grid grid-cols-3  gap-4 px-5 ">
          {/* <CustomInputField
              title="Pickup Location"
              type="text"
              placeholder="Edappally, Kochi, Kerala"
              name="pickupLocation"
              value={formik.values.pickupLocation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.pickupLocation}
              touched={formik.touched.pickupLocation}
            /> */}
          {/* <CustomInputField
              title="Postal Code"
              type="text"
              placeholder="postal code"
              name="postalCode"
              value={formik.values.postalCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.postalCode}
              touched={formik.touched.postalCode}
            /> */}

        </div>

        {/* input field with toggle section end  */}

        {/* map container div  */}
        {/* <div className="grid cols-1 m-5  pt-3">
            <img src={map} alt="map" />
          </div> */}
        {/* map container div end */}

      </div>
      {/* -------------------------------------- main container div end --------------------------------------- */}
    </>
  );
};

export default PickupSection1;














