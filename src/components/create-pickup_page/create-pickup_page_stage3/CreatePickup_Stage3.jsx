import React, { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import Dropdown from "../../input-field/Dropdown";
import upi from "../../../images/upi.png";
import cash from "../../../images/cash.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import request from '../../../utils/request';
import { FaSuitcase } from "react-icons/fa";

const CreatePickup_Stage3 = forwardRef((props, ref) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [insuranceList, setInsuranceList] = useState();
  const { formik } = props;

  const handleSelect = (option) => {
    props?.setInsurance(option)
    setSelectedOption(option);
  };
  const options = insuranceList?.map((item) => ({
    label: item?.insuranceProviderName,
    value: item?.insuranceProviderId,
  }));

  const fetchInsuranceList = () => {
    request({
      url: "V1/insuranceproviders",
      method: "GET",
    })
      .then((response) => {
        setInsuranceList(response.data);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          toast.dismiss();
          toast.error(error.response.data.message);
        }
      });
  };

  // const modifiedPackages = formik.values?.packages?.map(({ images, ewaybillFile, declarationFile, ...rest }) => rest);
  const modifiedPackages = formik.values?.packages?.map(({ images, ewaybillFile, declarationFile, ...rest }) => ({
    ...rest,
    boxType: formik.values?.boxType  // inject boxType into each package
  }));
  const packagesJson = JSON.stringify(modifiedPackages);

  const fetchSummaryDetails = () => {
    request({
      url: `V1/customer/getestimatedBookingSummary`,
      method: "POST",
      data:{
        consignerAddressId:props?.selectedConsigner,
        consigneeAddressId:props?.selectedConsignee,
        noOfBoxes:formik.values?.packages?.length,
        modeOfTransport:formik.values?.modeType,
        pickupScheduleFrom:formik.values?.pickupScheduleFrom,
        pickupScheduleTo:formik.values?.pickupScheduleTo,
        boxesJson:packagesJson,
        isAppoinment:props?.isAppoinment,
        insuranceProviderId:selectedOption?.value
      }
    })
      .then((response) => {
        props?.setSummaryData(response?.data[0]);
         
      })
      .catch((error) => {
        if (error.response?.status === 500) {
          toast.dismiss();
          toast.error(error.response.data.message);
        }
      });
  };

  useEffect(() => {
    fetchInsuranceList();
  }, []);

  useEffect(() => {
    fetchSummaryDetails();
  }, [selectedOption]);

  useEffect(() => {
    if (insuranceList && props.insurance) {
      const matched = insuranceList.find(
        (item) => item.insuranceProviderId === props.insurance
      );

      if (matched) {
        const option = {
          label: matched.insuranceProviderName,
          value: matched.insuranceProviderId,
        };
        setSelectedOption(option);
      }
    }
  }, [insuranceList, props.insurance]);

  useImperativeHandle(ref, () => ({
    submitForm: () => formik.handleSubmit(),
    getFormValues: () => formik.values,
    getFormErrors: () => formik.errors,
  }));

  // console.log(props?.summaryData)

  return (
    <>
      <div className="p-4">
        <form onSubmit={formik.handleSubmit}>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5 mt-5 ">
            <div className="w-full mb-5">
              <h5 className="text-2xl bold-sansation mb-4">Boxes</h5>
              <table className="w-full table-fixed border border-1 mb-5">
                <thead>
                  <tr className="border border-1">
                    <th className="text-center px-3 py-2 ">Sl No</th>
                    <th className="text-center px-3 py-2">Type</th>
                    <th className="text-center px-3 py-2">L x W x H</th>
                    <th className="text-center px-3 py-2 ">Weight (Vol)</th>
                    <th className="text-center px-3 py-2">Weight (Aprox)</th>
                  </tr>
                </thead>
                <tbody>
                  {formik?.values?.packages.map((item, index) => (
                    <tr key={index} className="border border-1">
                      <td className="text-center px-3 py-2">{index + 1}</td>
                      <td className="text-center px-3 py-2">{formik.values?.boxType}</td>
                      <td className="text-center px-3 py-2">{`${item.boxLength} x ${item.boxBreadth} x ${item.boxWidth} cm`}</td>
                      <td className="text-center px-3 py-2">{item.volumetricWeight}</td>
                      <td className="text-center px-3 py-2">{item.approxWeight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-[#F1F1F1] border rounded-2xl relative">
                <p className="absolute -top-3 left-4 bg-custom-white w-1/5 flex justify-center border text-[#A3A3A3] rounded-md font-sansation font-regular">
                  Additional
                </p>
                <div className="p-5">
                  <div className="flex items-center gap-2 ">
                    <h5 className="font-sansation font-regular">Insurance</h5>
                    <IoMdInformationCircleOutline className="text-[#FF0000]" />
                  </div>
                  <Dropdown
                    options={options}
                    placeholder="Select Insurance Provider"
                    value={selectedOption}
                    onChange={handleSelect}
                  />
                </div>
              </div>
            </div>
            <div>
              <div>
                {/* {console.log("new dsa", props?.selectedConsignerData)} */}
                <h3 className="text-2xl font-bold font-sansation mb-3">Address</h3>
                <h4 className="text-xl font-bold font-sansation mb-2">From</h4>
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <FaSuitcase />
                    <p className="text-xl font-bold font-sansation">{props?.selectedConsignerData?.fullName}</p>
                  </div>
                  <p>{props?.selectedConsignerData?.addressLine1 + ',' + props?.selectedConsignerData?.cityName + ',' + props?.selectedConsignerData?.stateName + "," + props?.selectedConsignerData?.postalCode + "," + props?.selectedConsignerData?.countryName}</p>
                </div>
                <h4 className="text-xl font-bold font-sansation mb-2">To</h4>
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <FaSuitcase />
                    <p className="text-xl font-bold font-sansation">{props?.selectedConsigneeData?.fullName}</p>
                  </div>
                  <p>{props?.selectedConsigneeData?.addressLine1 + ',' + props?.selectedConsigneeData?.cityName + "," + props?.selectedConsigneeData?.stateName + ',' + props?.selectedConsigneeData?.postalCode + "," + props?.selectedConsigneeData?.countryName}</p>
                </div>
              </div>
              <h5 className="bold-sansation text-lg">Cost Summary</h5>
              <div className="flex justify-between py-1 text-sm">
                <div>SubTotal</div>
                <div>₹ {props?.summaryData?.subTotal}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div>SubTotal Discount</div>
                <div>₹ {props?.summaryData?.subTotalDiscount}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div>Handling Charges</div>
                <div>₹ {props?.summaryData?.handlingCharges}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div>Penalty Amount</div>
                <div>₹ {props?.summaryData?.penaltyAmount}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div>Extra Charges</div>
                <div>₹ {props?.summaryData?.extraCharges}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div>Additional Discount</div>
                <div>₹ {props?.summaryData?.additionalDiscount}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div>Tax({props?.summaryData?.taxPercentage}%)</div>
                {/* <div>₹ {props?.summaryData?.subTotal*(props?.summaryData?.subTotal*(props?.summaryData?.taxPercentage/100))}</div> */}
                <div>₹ {props?.summaryData?.tax}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div>Insurance Amount</div>
                <div>₹ {props?.summaryData?.insuranceAmount}</div>
              </div>
              <div className="bg-custom-gray flex justify-between p-2 px-4 bold-sansation my-4 border rounded-md">
                <div>Total</div>
                <div>₹ {props?.summaryData?.grandTotal}</div>
              </div>
            </div>
          </div>
          <p className="bold-sansation mt-5">Payment Options<span className="text-red-500"> *</span></p>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 mt-4">
            <div className="grid grid-cols-2">
              <div className="flex gap-5 items-center">
                <div className="w-[3rem]">
                  <img src={upi} alt="upi image" />
                </div>
                <h5 className="font-sansation font-regular">UPI</h5>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.paymentMethod === "upi"}
                  className="transform scale-150 cursor-pointer"
                />
              </div>
              <div className="flex gap-5 items-center">
                <div className="w-[3rem]">
                  <img src={cash} alt="cash image" />
                </div>
                <h5 className="font-sansation font-regular">Cash</h5>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.paymentMethod === "cash"}
                  className="transform scale-150 cursor-pointer"
                />
              </div>
              {formik.errors.paymentMethod && formik.touched.paymentMethod && (
                <div className="text-red-500 mt-1 text-sm">{formik.errors.paymentMethod}</div>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
});

export default CreatePickup_Stage3;
