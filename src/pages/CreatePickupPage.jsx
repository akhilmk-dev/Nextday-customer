import React, { useState, useRef, useEffect } from "react";
import PickupSection1 from "../components/create-pickup_page/create-pickup_page_stage1/PickupSection1";
import PickupSection2 from "../components/create-pickup_page/create-pickup_page_stage1/PickupSection2";
import Stepper from "../components/stepper/Stepper";
import Button from "../components/button/Button";
import Button2 from "../components/button/Button2";
import CreatePickupStage2 from "../components/create-pickup_page/create-pickup_page_stage2/CreatePickupStage2";
import CreatePickup_Stage3 from "../components/create-pickup_page/create-pickup_page_stage3/CreatePickup_Stage3";
import { useFormik } from "formik";
import * as Yup from "yup";
import { pincodeValidation } from "../utils/validation-schema/commonValidation";
import toast from "react-hot-toast";
import request from '../utils/request'
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { convertDateFormat, convertDateFormatUTC } from "../utils/helpers";
import ClipLoader from "react-spinners/ClipLoader";

const normalValidation = Yup.object({
  modeType: Yup.string().required("Please select a mode type"),
  pickupScheduleFrom: Yup.string().required("Please select a pickup schedule"),
  pickupScheduleTo: Yup.string()
    .required("Please select a pickup time")
    // .test("pickup-time-after-schedule", "To time must be after the From time", function (value) {
    //   const { pickupScheduleFrom } = this.parent; // Access the other field value

    //   if (pickupScheduleFrom && value) {
    //     const fromDate = new Date(pickupScheduleFrom);
    //     const toDate = new Date(value);

    //     // Check if pickupScheduleTo is after pickupScheduleFrom
    //     return toDate > fromDate; // Validates that toDate is later than fromDate
    //   }

    //   return true; // If one of the values is not set, don't fail the validation
    // }),
    .test("pickup-time-after-schedule", "To time must be after the From time", function (value) {
      const { pickupScheduleFrom } = this.parent;
      if (pickupScheduleFrom && value) {
        return new Date(value).getTime() > new Date(pickupScheduleFrom).getTime();
      }
      return true;
    }),

  // boxType: Yup.string().required("Package type is required"),
  packages: Yup.array().of(
    Yup.object().shape({
      boxWidth: Yup.number().required("Width is required").positive().integer(),
      boxBreadth: Yup.number().required("Breadth is required").positive().integer(),
      boxLength: Yup.number().required("Height is required").positive().integer(),
      approxWeight: Yup.number()
        .required("Actual weight is required")
        .positive()
        .integer(),
      boxDescription: Yup.string()
        .nullable()
        .notRequired(),
      // .required("Item description is required"),
      volumetricWeight: Yup.number()
        .required("Volumetric weight is required")
        .positive(),
      packageValue: Yup.string()
        .required("Package value is required")
        .test('is-number', 'Invoice value must be a number', (value) => !isNaN(Number(value))),
      ewaybillNo: Yup.string()
        .test('is-required', 'E-Way Bill No is required', function (value) {
          const { packageValue } = this.parent;
          return Number(packageValue) > 50000 ? !!value : true;
        }),
      withInvoice: Yup.boolean(),
      ewaybillFile: Yup.string().nullable()
        .test('is-required-file', 'E-Way Bill file is required ', function (value) {
          const { packageValue } = this.parent;
          return Number(packageValue) > 50000 ? !!value : true;
        }),
      declarationFile: Yup.string()
        .test('is-required-declaration', 'Declaration file is required', function (value) {
          const { withInvoice } = this.parent;
          return withInvoice ? !!value : true;
        }),
      images: Yup.array()
        .of(
          Yup.object().shape({
            imageUrl: Yup.string().required("Image is required")
          })
        )
        .nullable()
        .notRequired(),
      // .required("At least one image is required")
      // .min(1, "At least one image is required"),
    })
  ),
  // paymentMethod: Yup.string().required("Payment method is required"),
});


// const skipValidation = Yup.object({
//   modeType: Yup.string().required("Please select a mode type"),
//   pickupScheduleFrom: Yup.string().required("Please select a pickup schedule"),
//   pickupScheduleTo: Yup.string().required("Please select a pickup time"),
//   // paymentMethod: Yup.string().required("Payment method is required"),
// })

// const convertDateFormat = (inputDate) => {
//   // Create a new Date object from the input string
//   const date = new Date(inputDate);

//   // Format year, month, day, hours, minutes, seconds, and milliseconds
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
//   const day = String(date.getDate()).padStart(2, '0');
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');
//   const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

//   // Combine them into the desired format
//   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
// };

const CreatePickupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedConsigner, setSelectedConsigner] = useState(null);
  const [selectedConsignee, setSelectedConsignee] = useState(null);
  const [selectedConsignerData, setSelectedConsignerData] = useState({});
  const [selectedConsigneeData, setSelectedConsigneeData] = useState({});
  const [summaryData, setSummaryData] = useState();
  const [skip, setSkip] = useState(false);
  const [isReversePickup, setIsReversePickup] = useState(false);
  const [isToPay, setIsToPay] = useState(false);
  const [isAppoinment,setIsAppointment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const localStoredData = JSON.parse(localStorage.getItem("package"));
  let localStoredData = null;
  try {
    const data = sessionStorage.getItem("package");
    localStoredData = data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Failed to parse sessionStorage data:", err);
  }

  const [imagePreviews, setImagePreviews] = useState(localStoredData?.packages ? localStoredData?.packages?.map(item => item?.images?.filter(item => item?.imageUrl)?.map(item => item?.imageUrl)) : []);
  const [packages, setPackages] = useState([{}]);
  const [paymentMethod, setPaymentMethod] = useState();
  const [insurance, setInsurance] = useState();
  const [pickupData, setPickupData] = useState();
  const [bookingDetails, setBookingDetails] = useState();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pickupReqId = queryParams.get("pickupReqId");
  const [searchParams] = useSearchParams();
  const [noOfBoxes,setNoOfBoxes]=useState();
  const [isAllSame,setIsAllSame] = useState();
  const editId = searchParams.get("id");
  // console.log(packages, "pack in cRF")

  const navigate = useNavigate()

  const [formData, setFormData] = useState(localStoredData ? localStoredData : {
    pickupScheduleFrom: "",
    pickupScheduleTo: "",
    // pickupLocation: "",
    // postalCode: ""
    // ,
    modeType: "road",
    boxType: "non-dox",
    toPay: 0,
    packages: [
      {
        boxWidth: "",
        boxLength: "",
        boxBreadth: "",
        boxDescription: "",
        volumetricWeight: "",
        approxWeight: "",
        packageValue: "",
        packageNumber:"",
        images: null,
        ewaybillNo:"",
        declarationFile: null,
        ewaybillFile: null,
        withInvoice: false
      },
    ],
    paymentMethod: "",
  });

  const fetchBookingDetails = () => {
    request({
      url: `/V1/customer/editbooking/${editId}`,
      method: "GET"
    }).then((response) => {
      if (response?.data) {
        setBookingDetails(response?.data);
      }
    }).catch((error) => {
      if (error.response.status == 500) {
        toast.dismiss();
        toast.error(error.response.data.message)
      }
    })
  }

  useEffect(() => {
    if (editId) {
      fetchBookingDetails()
    }
  }, [editId])

  useEffect(() => {
    if (!editId) {
      sessionStorage.clear();
      setFormData({
        pickupScheduleFrom: "",
        pickupScheduleTo: "",
        // pickupLocation: "",
        // postalCode: ""
        // ,
        modeType: "road",
        boxType: "non-dox",
        toPay: 0,
        packages: [
          {
            boxWidth: "",
            boxLength: "",
            boxBreadth: "",
            boxDescription: "",
            volumetricWeight: "",
            approxWeight: "",
            packageValue: "",
            ewaybillNo:"",
            packageNumber:"",
            images: null,
            ewaybillFile: null,
            withInvoice: false
          },
        ],
        paymentMethod: "",
      })
      localStoredData = null;
    }
  }, [])

  useEffect(() => {
    if (bookingDetails) {
      const packagess = JSON?.parse(bookingDetails?.booking?.boxes)?.map(item => ({
        boxWidth: item?.boxWidth,
        boxLength: item?.boxLength,
        boxBreadth: item?.boxBreadth,
        boxDescription: "",
        volumetricWeight: item?.volumetricWeight,
        approxWeight: item?.approxWeight,
        packageValue: item?.packageValue,
        images: item?.boxImages?.filter(item => item?.imageUrl)?.map(item => ({ imageUrl: item?.imageUrl })),
        declarationFile: item?.declarationFile,
        ewaybillFile: item?.ewaybillFile,
        withInvoice: item?.withInvoice,
        packageNumber: item?.packageNumber
      }))
      setFormData({
        pickupScheduleFrom: convertDateFormatUTC(bookingDetails?.pickupRequest?.pickupScheduleFrom),
        pickupScheduleTo: convertDateFormatUTC(bookingDetails?.pickupRequest?.pickupScheduleTo),
        modeType: bookingDetails?.booking?.ModeOfTransport,
        boxType: JSON.parse(bookingDetails?.booking?.boxes)?.[0]?.boxType,
        toPay: bookingDetails?.booking?.IsToPay ? 1 : 0,
        packages: packagess,
        paymentMethod: ""
      })
      setImagePreviews(packagess?.map(item => item?.images?.filter(item => item?.imageUrl)?.map(item => item?.imageUrl)))
      setPackages(packagess)
      setInsurance(bookingDetails?.booking?.insuranceProvider)

      setSelectedConsigner(JSON?.parse(bookingDetails?.pickupRequest?.consignerAddress)[0]?.AddressId);
      setSelectedConsignee(JSON?.parse(bookingDetails?.booking?.consigneeAddress)[0]?.AddressId);
      let consigneeAddress = JSON?.parse(bookingDetails?.booking?.consigneeAddress)[0];
      let consignerAddress = JSON?.parse(bookingDetails?.pickupRequest?.consignerAddress)[0];
      sessionStorage.setItem("selectedConsignee", JSON?.stringify({ addressId: consigneeAddress?.AddressId, fullName: consigneeAddress?.fullName, cityName: consigneeAddress?.CityName, stateName: consigneeAddress?.StateName, addressLine1: consigneeAddress?.AddressLine1, postalCode: consigneeAddress?.PostalCode, countryName: consigneeAddress?.CountryName }))
      sessionStorage.setItem("selectedConsigner", JSON?.stringify({ addressId: consignerAddress?.AddressId, fullName: consignerAddress?.fullName, cityName: consignerAddress?.CityName, stateName: consignerAddress?.StateName, addressLine1: consignerAddress?.AddressLine1, postalCode: consignerAddress?.PostalCode, countryName: consignerAddress?.CountryName }))
      setSelectedConsigner(consignerAddress?.AddressId);
      setSelectedConsignee(consigneeAddress?.AddressId)
      setIsToPay(bookingDetails?.booking?.IsToPay);
      setIsAppointment(bookingDetails?.isAppoinment);
      setIsReversePickup(bookingDetails?.booking?.IsReversePickup)
      sessionStorage.setItem("package", packages);
    }
  }, [bookingDetails])

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  // useEffect(()=>{
  //   if(localStoredData?.packages){
  //     setPackages(localStoredData?.packages)
  //   }
  // },[localStoredData])

  // useEffect(() => {
  //   const localStoredData = sessionStorage.getItem("package");

  //   if (localStoredData) {
  //     try {
  //       const parsedData = JSON.parse(localStoredData);

  //       if (parsedData?.packages) {
  //         setPackages((prev) => {
  //           const isSame = JSON.stringify(prev) === JSON.stringify(parsedData.packages);
  //           return isSame ? prev : parsedData.packages;
  //         });
  //         console.log(parsedData.packages, "useEffect");
  //       }
  //     } catch (error) {
  //       console.error("Failed to parse session data:", error);
  //     }
  //   }
  // }, [localStoredData]);


  // const [pickupData,setPickupData] = useState([]);
  // // ref is used for access the create pickup stage3 form
  // const stage3Ref = useRef(null);

  // const handleCompletePickup = () => {
  //   if (stage3Ref.current) {
  //     stage3Ref.current.submitForm();
  //   }
  // };

  const markAllFieldsTouched = () => {
    // Mark general fields
    formik.setFieldTouched("modeType", true);
    formik.setFieldTouched("pickupScheduleFrom", true);
    formik.setFieldTouched("pickupScheduleTo", true);
    formik.setFieldTouched("toPay", true);
    // formik.setFieldTouched("boxType", true);

    // Mark package fields
    formik.values.packages.forEach((_, index) => {
      formik.setFieldTouched(`packages[${index}].boxWidth`, true);
      formik.setFieldTouched(`packages[${index}].boxBreadth`, true);
      formik.setFieldTouched(`packages[${index}].boxLength`, true);
      formik.setFieldTouched(`packages[${index}].approxWeight`, true);
      formik.setFieldTouched(`packages[${index}].boxDescription`, true);
      formik.setFieldTouched(`packages[${index}].volumetricWeight`, true);
      formik.setFieldTouched(`packages[${index}].packageValue`, true);
      formik.setFieldTouched(`packages[${index}].images`, true);
      formik.setFieldTouched(`packages[${index}].ewaybillNo`, true);
      formik.setFieldTouched(`packages[${index}].ewaybillFile`, true);
      formik.setFieldTouched(`packages[${index}].declarationFile`, true);
    });
  };

  const fetchEditData = async () => {
    request({
      url: `V1/customer/pickup-request/${pickupReqId}`,
      method: 'GET',
    }).then((response) => {
      setPickupData(response?.data?.[0]);
    }).catch((err) => {
      toast.dismiss();
      toast.error(response.message);
    });
  }

  useEffect(() => {
    if (pickupReqId) {
      fetchEditData();
    }
  }, [pickupReqId])

  useEffect(() => {
    if (pickupData) {
      formik.setFieldValue('pickupScheduleFrom', convertDateFormatUTC(pickupData?.pickupScheduleFrom));
      formik.setFieldValue('pickupScheduleTo', convertDateFormatUTC(pickupData?.pickupScheduleTo))
    }
  }, [pickupData])

  // console.log(formData, "formData")

  const stage3Ref = useRef(null);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formData,
    validationSchema: normalValidation,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: (values) => {
      setIsSubmitting(true);
      if (editId) {
        request({
          url: `V1/customer/booking`,
          method: "PUT",
          data: {
            bookingId: bookingDetails?.booking?.BookingId,
            consignerAddressId: selectedConsigner,
            consigneeAddressId: selectedConsignee,
            isReversePickup: isReversePickup,
            isAppoinment: isAppoinment,
            isPickupRequest: skip ? 1 : 0,
            isTopay: isToPay,
            noOfBoxes: values?.packages?.length,
            approxTotalWeight: 0,
            modeOfTransport: values?.modeType,
            pickupScheduleFrom: convertDateFormat(values?.pickupScheduleFrom),
            pickupScheduleTo: convertDateFormat(values?.pickupScheduleTo),
            boxType: values?.boxType,
            estimatedCost: summaryData?.grandTotal,
            discount: summaryData?.discount ? summaryData?.discount : "",
            deliveryCharge: summaryData?.shippingCost ? summaryData?.shippingCost : 0,
            otherCharges: summaryData?.insuranceAmount ? summaryData?.insuranceAmount : 0,
            taxAmount: summaryData?.shippingTax ? summaryData?.shippingTax : 0,
            grandTotal: summaryData?.grandTotal ? summaryData?.grandTotal : 0,
            boxesJson: JSON.stringify(values?.packages?.map(item=> ({...item,isIdentical:isAllSame,noOfBoxes,boxType:values?.boxType}))),
            createdByStaffId: null,
            franchiseId: null,
            pickupReqId: pickupReqId ? pickupReqId : null,
            insuranceProvider: insurance?.value,
            paymentMode: values?.paymentMethod,
            rateId: summaryData?.rateId ? summaryData?.rateId : null,
            subTotal: summaryData?.subTotal ? summaryData?.subTotal : 0,
          }
        }).then((response) => {
          // localStoredData.removeItem("package")
          try {
            sessionStorage.removeItem("package");
            sessionStorage.removeItem("pickupOptions");
            sessionStorage.removeItem("selectedConsigner");
            sessionStorage.removeItem("selectedConsignee");
            toast.dismiss()
            toast.success(response?.message)
          } catch (err) {
            console.error("Failed to remove item from sessionStorage:", err);
          }

          // navigate(`/success?reqNo=${skip ? response?.data?.[0]?.pickupReqNo : response?.data?.[0]?.awbNumber}&referenceNumber=${response?.data?.[0]?.referenceNumber ? response?.data?.[0]?.referenceNumber : 0}&bookingId=${response?.data?.[0]?.bookingId ? response?.data?.[0]?.bookingId : ""}&pickupReqId=${pickupReqId}`, { state: { fromBooking: true } })
          const pickupReqParam = (pickupReqId && pickupReqId !== "null" && pickupReqId !== "undefined")
            ? `&pickupReqId=${pickupReqId}`
            : "";

          navigate(
            `/success?reqNo=${skip ? response?.data?.[0]?.pickupReqNo : response?.data?.[0]?.awbNumber
            }&referenceNumber=${response?.data?.[0]?.referenceNumber || 0
            }&bookingId=${response?.data?.[0]?.bookingId || ""}${pickupReqParam}`,
            { state: { fromBooking: true, edit: true } }
          );
        }).catch((error) => {
          if (error.response.status === 500) {
            toast.dismiss();
            toast.error(error.response.data.message);
          }
        }).finally(() => {
          setIsSubmitting(false);
        });
      } else {
        request({
          url: `V1/customer/booking`,
          method: "POST",
          data: {
            consignerAddressId: selectedConsigner,
            consigneeAddressId: selectedConsignee,
            isReversePickup: isReversePickup,
            isAppoinment: isAppoinment,
            isPickupRequest: skip ? 1 : 0,
            isTopay: isToPay,
            noOfBoxes: values?.packages?.length,
            approxTotalWeight: 0,
            modeOfTransport: values?.modeType,
            pickupScheduleFrom: convertDateFormat(values?.pickupScheduleFrom),
            pickupScheduleTo: convertDateFormat(values?.pickupScheduleTo),
            boxType: values?.boxType,
            estimatedCost: summaryData?.grandTotal,
            discount: summaryData?.discount ? summaryData?.discount : "",
            deliveryCharge: summaryData?.shippingCost ? summaryData?.shippingCost : 0,
            otherCharges: summaryData?.insuranceAmount ? summaryData?.insuranceAmount : 0,
            taxAmount: summaryData?.shippingTax ? summaryData?.shippingTax : 0,
            grandTotal: summaryData?.grandTotal ? summaryData?.grandTotal : 0,
            boxesJson: JSON.stringify(values?.packages?.map(item=> ({...item,isIdentical:isAllSame,noOfBoxes,boxType:values?.boxType}))),
            createdByStaffId: null,
            franchiseId: null,
            pickupReqId: pickupReqId ? pickupReqId : null,
            insuranceProvider: insurance?.value,
            paymentMode: values?.paymentMethod,
            rateId: summaryData?.rateId ? summaryData?.rateId : null,
            subTotal: summaryData?.subTotal ? summaryData?.subTotal : 0,
          }
        }).then((response) => {
          // localStoredData.removeItem("package")
          try {
            sessionStorage.removeItem("package");
            sessionStorage.removeItem("pickupOptions");
            sessionStorage.removeItem("selectedConsigner");
            sessionStorage.removeItem("selectedConsignee");
            toast.success(response?.message);
          } catch (err) {
            console.error("Failed to remove item from sessionStorage:", err);
          }

          // navigate(`/success?reqNo=${skip ? response?.data?.[0]?.pickupReqNo : response?.data?.[0]?.awbNumber}&referenceNumber=${response?.data?.[0]?.referenceNumber ? response?.data?.[0]?.referenceNumber : 0}&bookingId=${response?.data?.[0]?.bookingId ? response?.data?.[0]?.bookingId : ""}&pickupReqId=${pickupReqId}`, { state: { fromBooking: true } })
          const pickupReqParam = (pickupReqId && pickupReqId !== "null" && pickupReqId !== "undefined")
            ? `&pickupReqId=${pickupReqId}`
            : "";

          navigate(
            `/success?reqNo=${skip ? response?.data?.[0]?.pickupReqNo : response?.data?.[0]?.awbNumber
            }&referenceNumber=${response?.data?.[0]?.referenceNumber || 0
            }&bookingId=${response?.data?.[0]?.bookingId || ""}${pickupReqParam}`,
            { state: { fromBooking: true } }
          );
        }).catch((error) => {
          if (error.response.status === 500) {
            toast.dismiss();
            toast.error(error.response.data.message);
          }
        }).finally(() => {
          setIsSubmitting(false);
        });
      }
    },
  });

  useEffect(() => {
    const savedData = sessionStorage.getItem("pickupOptions");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData?.isToPay !== undefined) {
        setIsToPay(parsedData.isToPay);
      }
      if (parsedData?.isReversePickup !== undefined) {
        setIsReversePickup(parsedData.isReversePickup);
      }
      if (parsedData?.isAppoinment !== undefined) {
        setIsAppointment(parsedData.isAppoinment);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "pickupOptions",
      JSON.stringify({ isToPay, isReversePickup,isAppoinment })
    );
  }, [isToPay, isReversePickup,isAppoinment]);

  const saveTimeoutRef = useRef(null);

  const debounceSessionSave = (key, data, delay = 500) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const jsonData = JSON.stringify(data);
        const sizeInKB = new Blob([jsonData]).size / 1024;

        if (sizeInKB > 4800) {
          console.warn("SessionStorage limit exceeded:", sizeInKB.toFixed(2), "KB");
          return;
        }
        sessionStorage.setItem(key, jsonData);
      } catch (error) {
        console.error("Failed to save sessionStorage:", error);
      }
    }, delay);
  };

  useEffect(() => {
    if (formik.values) {
      debounceSessionSave("package", formik.values);
    }
  }, [formik.values]);

  // useEffect(()=>{
  //   if(localStoredData?.packages){
  //     setPackages(localStoredData?.packages)
  //   }
  // },[localStoredData])

  useEffect(() => {
    try {
      const data = sessionStorage.getItem("package");
      const parsed = data ? JSON?.parse(data) : null;

      if (parsed?.packages) {
        setPackages(parsed.packages);
      }
    } catch (err) {
      console.error("Failed to parse sessionStorage data:", err);
    }
  }, []); // Empty dependency array ensures it runs only once on mount

  // const handleNext = () => {
  //   formik.validateForm().then((errors) => {
  //     console.log(errors)
  //     if (Object.keys(errors).length === 0) {
  //       setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
  //       console.log("oooooooooooooo")
  //     }
  //   });
  // };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!selectedConsigner) {
        toast.dismiss();
        toast.error('Please select a consigner address')
      } else if (!selectedConsignee) {
        toast.dismiss();
        toast.error('Please select a consignee address');
      } else {
        setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
      }
    } else if (currentStep === 1) {
      // localStorage.setItem("package", JSON.stringify(formik.values));
      // try {
      //   const formData = JSON.stringify(formik.values);
      //   // Estimate size before saving (in KB)
      //   const sizeInKB = new Blob([formData]).size / 1024;

      //   if (sizeInKB > 4800) { // ~4.8MB safety threshold
      //     console.warn("SessionStorage limit exceeded! Size:", sizeInKB.toFixed(2), "KB");
      //   } else {
      //     sessionStorage.setItem("package", formData);
      //     console.log("Form data (with images) saved successfully to sessionStorage.");
      //   }
      // } catch (err) {
      //   console.error("Error saving to sessionStorage:", err);
      // }

      // setFormData(formik.values);

      // markAllFieldsTouched();
      if(noOfBoxes != formik.values?.packages?.length && !isAllSame){
        toast.dismiss()
        toast.error(`${noOfBoxes} boxes are required`)
        return;
      }
      formik.validateForm().then((errors) => {
        markAllFieldsTouched(); // Mark fields as touched AFTER validation triggers errors
        if (Object.keys(errors).length === 0 && !skip) {
          if(isAllSame){
            const packages= new Array(Number(noOfBoxes)).fill(null).map(() => ({ ...formik.values.packages[0] }));
            setFormData({...formik.values,packages:packages})
          }else{
            setFormData(formik.values);
          }
           // Only update formData when you're moving ahead
          setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
        } else if (Object.keys(errors).length === 0 && skip) {
          if(isAllSame){
            const packages= new Array(noOfBoxes).fill(null).map(() => ({ ...formik.values.packages[0] }));
            setFormData({...formik.values,packages:packages})
          }else{
            setFormData(formik.values); 
          }
          formik.handleSubmit();
        } else {
          console.log(errors, "Errors found. Not moving to the next step.");
        }
      });
    } else {
      setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
    }
  };

  return (
    <>
      {/* ---------------------------- main container div ----------------------------- */}
      <div className="container mx-auto p-[0.535rem] pt-[116px] lg:pt-0">
        <h5 className="px-3 text-3xl bold-sansation my-5 ">Create Booking</h5>
        {/* stepper component */}
        <Stepper
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          finalContent="You've completed all steps!"
        />
        {/* ------------- pickup first page ----------- */}
        {currentStep === 1 && (
          <>
            <PickupSection1 formik={formik} isAppoinment={isAppoinment} setIsAppointment={setIsAppointment} isReversePickup={isReversePickup} setIsReversePickup={setIsReversePickup} isToPay={isToPay} setIsToPay={setIsToPay} />
            <PickupSection2 noOfBoxes={noOfBoxes} isAllSame={isAllSame}  setNoOfBoxes={setNoOfBoxes} setIsAllSame={setIsAllSame}  formik={formik} setSkip={setSkip} skip={skip} packages={packages} setPackages={setPackages} imagePreviews={imagePreviews} setImagePreviews={setImagePreviews} />
          </>
        )}
        {/* ------------- pickup first page end ----------- */}

        {/* ------------- pickup second page ----------- */}

        {currentStep === 2 && (
          <>
            <CreatePickupStage2 selectedConsignee={selectedConsignee} isToPay={isToPay} setSelectedConsignee={setSelectedConsignee} selectedConsigner={selectedConsigner} setSelectedConsigner={setSelectedConsigner} formik={formik} setSelectedConsignerData={setSelectedConsignerData} setSelectedConsigneeData={setSelectedConsigneeData} />
          </>
        )}

        {/* ------------- pickup second page end ----------- */}

        {/* ------------- pickup third page ----------- */}

        {currentStep === 3 && <CreatePickup_Stage3 summaryData={summaryData} isAllSame={isAllSame} noOfBoxes={noOfBoxes} setSummaryData={setSummaryData} insurance={insurance} setInsurance={setInsurance} isAppoinment={isAppoinment} ref={stage3Ref} formik={formik} selectedConsignee={selectedConsignee} selectedConsigner={selectedConsigner} selectedConsigneeData={selectedConsigneeData} selectedConsignerData={selectedConsignerData} />}

        {/* ------------- pickup third page end----------- */}

        {/* next , previous , complete pickip button div */}
        <div className="relative p-4 my-5">
          <div className="flex justify-between my-5">
            {/* previous button */}
            <div className={`w-1/6 ${currentStep > 1 ? "block" : "hidden"}`}>
              <Button2
                buttonText="Previous"
                className="px-7 bg-white text-custom-green border-custom-green hover:border-custom-gray hover:bg-[#CAFFE5] absolute left-4"
                onClick={() => {
                  setCurrentStep((prevStep) => Math.max(prevStep - 1, 1))
                  // setPackageDetail(JSON.parse(localStorage.getItem("package")));
                }
                }
              // style={{ display: currentStep > 1 ? "block" : "none" }}
              />
            </div>
            {/* {currentStep === 1 && (<Button
              buttonText="Back"
              className="px-9 absolute left-4"
              onClick={() => navigate(-1)}
            />)} */}

            {currentStep === 3 ? (
              <>
                <Button
                  buttonText={
                    isSubmitting ? (
                      <ClipLoader size={18} color='white' />
                    ) : "Create Booking"
                  }
                  className={'min-w-[180px] px-3 absolute right-4'}
                  onClick={() => {
                    if (!formik.values.paymentMethod) {
                      toast.dismiss();
                      toast.error("Payment method is required");
                      return;
                    }
                    formik.handleSubmit();
                  }}
                  disabled={isSubmitting}
                />

              </>
            ) : (
              <>
                {/* next pickup button */}
                <Button
                  buttonText="Next"
                  className="px-9 absolute right-4"
                  onClick={handleNext}
                />
              </>
            )}
          </div>
        </div>
        {/* next and previous button div end */}
      </div>
      {/* ---------------------------- main container div end ----------------------------- */}
    </>
  );
};

export default CreatePickupPage;
