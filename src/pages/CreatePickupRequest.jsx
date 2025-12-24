import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import request from '../utils/request';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { convertDateFormat, getTodayDate, convertDateFormatUTC, convertLocalToUTCISOString } from '../utils/helpers';
import PICKUP_IMG from '../images/pickupRequest.png'
import { FaArrowLeft } from "react-icons/fa";
import CancelModal from '../components/Modals/CancelModal';

// Yup validation schema
const validationSchema = Yup.object({
  pickupScheduleFrom: Yup.string().required("Please select a pickup schedule"),
  pickupScheduleTo: Yup.string()
    .required("Please select a pickup time")
    .test("pickup-time-after-schedule", "To time must be after the From time", function (value) {
      const { pickupScheduleFrom } = this.parent; // Access the other field value

      if (pickupScheduleFrom && value) {
        const fromDate = new Date(pickupScheduleFrom);
        const toDate = new Date(value);

        // Check if pickupScheduleTo is after pickupScheduleFrom
        return toDate > fromDate; // Validates that toDate is later than fromDate
      }

      return true; // If one of the values is not set, don't fail the validation
    }),
  approxWeight: Yup.number().required('Approximate Weight is required').positive('Weight must be positive').integer('Weight must be an integer'),
});

const CreatePickupRequest = () => {
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location?.search);
  const id = queryParams.get('id');
  const [fromDate, setFromDate] = useState();
  const [minScheduleTo, setMinScheduleTo] = useState('');
  const [maxScheduleTo, setMaxScheduleTo] = useState('');
  const [isCancelPickup, setIsCancelPickup] = useState(false);

  const clearSessionStorage = () => {
    const keys = ["package", "pickupOptions", "selectedConsigner", "selectedConsignee"];
    keys.forEach((key) => sessionStorage.removeItem(key));
  };
  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
  
    const payload = {
      pickupScheduleFrom: convertDateFormat(values?.pickupScheduleFrom),
      pickupScheduleTo: convertDateFormat(values?.pickupScheduleTo),
      approxWeight: values?.approxWeight
    };
  
    const isUpdate = Boolean(editData);
  
    const requestOptions = {
      url: isUpdate ? `V1/customer/pickup-request/${editData?.pickupReqId}` : `V1/customer/pickup-request`,
      method: isUpdate ? 'PUT' : 'POST',
      data: payload
    };
  
    request(requestOptions)
      .then((response) => {
        clearSessionStorage();
        toast.dismiss();
        toast.success(response?.message);
        setLoading(false);
        navigate('/home/customer/my-bookings')
      })
      .catch((err) => {
        toast.dismiss();
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLoading(false);
      });
  };

  const fetchEditData = async () => {
    request({
      url: `V1/customer/pickup-request/${id}`,
      method: 'GET',
    }).then((response) => {
      setEditData(response?.data?.[0]);
    }).catch((err) => {
      toast.dismiss();
      toast.error(response.message);
    });
  }

  useEffect(() => {
    if (id) {
      fetchEditData();
    }
  }, [id])

  const initialValues = {
    pickupScheduleFrom: editData?.pickupScheduleFrom ? convertDateFormatUTC(editData?.pickupScheduleFrom) : null,
    pickupScheduleTo: editData?.pickupScheduleTo ? convertDateFormatUTC(editData?.pickupScheduleTo) : null,
    approxWeight: editData?.approxWeight || "",
  };

  useEffect(() => {
    if (fromDate) {
      const pickupFromDate = new Date(fromDate);
      const year = pickupFromDate.getFullYear();
      const month = String(pickupFromDate.getMonth() + 1).padStart(2, '0');
      const day = String(pickupFromDate.getDate()).padStart(2, '0');
      const hours = String(pickupFromDate.getHours()).padStart(2, '0');
      const minutes = String(pickupFromDate.getMinutes()).padStart(2, '0');
  
      const minTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      const maxTime = `${year}-${month}-${day}T23:59`;

      setMinScheduleTo(minTime);
      setMaxScheduleTo(maxTime);
    }
  }, [fromDate])

  const handlePickupScheduleFromChange = (e) => {
    const value = e.target.value;
    setFromDate(value); 
  };

  return (
    <>
    <CancelModal isCancelPickup={isCancelPickup} setIsCancelPickup={setIsCancelPickup} id={id}/>
    <div className="container mx-auto p-3 pt-[116px] lg:pt-0 ">
      <div className=" p-6 rounded-lg my-3 shadow-md w-full ">
        <div className='float-end'><button className="text-white bg-custom-green h-[45px] px-5 rounded-md font-sansation" onClick={() => navigate(-1)}>Back</button></div>
        <h1 className="text-3xl font-bold font-sansation text-gray-800 mb-6">{editData ? "Update Pickup Request" : "Create Pickup Request"}</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 h-full rounded-md shadow-sm' >
          <div className=''>
            <Formik
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue }) => (
                <Form className=''>
                  <div className='flex flex-col mb-3 gap-3 py-4'>
                    <div className="">
                      <label className="block font-regular font-sansation" htmlFor="pickupScheduleFrom">Pickup Schedule (From)<span className="text-red-500"> *</span></label>
                      <Field
                        type="datetime-local"
                        id="pickupScheduleFrom"
                        name="pickupScheduleFrom"
                        min={getTodayDate()}
                        onChange={(e) => {
                          handlePickupScheduleFromChange(e); 
                          setFieldValue('pickupScheduleFrom', e.target.value);
                        }}
                        className="mt-1 block w-full px-3 h-[45px] border rounded-md border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="pickupScheduleFrom" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="">
                      <label className="block font-regular font-sansation" htmlFor="pickupScheduleTo">Pickup Schedule (To)<span className="text-red-500"> *</span></label>
                      <Field
                        type="datetime-local"
                        id="pickupScheduleTo"
                        name="pickupScheduleTo"
                        min={minScheduleTo}
                        max={maxScheduleTo}
                        className="mt-1 block w-full px-3 h-[45px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="pickupScheduleTo" component="div" className="text-red-500 text-sm " />
                    </div>

                    <div className=" ">
                      <label className="block font-regular font-sansation" htmlFor="approxWeight">Actual Weight<span className="text-red-500"> *</span></label>
                      <Field
                        type="number"
                        id="approxWeight"
                        name="approxWeight"
                        placeholder="Enter actual weight"
                        style={{ height: "45px" }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="approxWeight" component="div" className="text-red-500 text-sm " />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                  {/* <button
                      type="button"
                      className=" py-2 px-4 bg-[#1ba169] text-white font-semibold font-sansation rounded-lg min-w-[100px] transition duration-300"
                      onClick={() => navigate(-1)}
                    >
                      Back
                    </button> */}
                    <button
                      type="submit"
                      className=" h-[45px] px-4 bg-[#1ba169] text-white font-semibold font-sansation rounded-lg min-w-[100px] transition duration-300"
                    >
                      {loading ? <ClipLoader color='white' size={18} /> : `${editData ? "Update" : "Submit"}`}
                    </button>
                    {editData && <button
                      type="button"
                      className=" h-[45px] px-4 bg-[#1ba169] text-white font-semibold font-sansation rounded-lg min-w-[100px] transition duration-300"
                      onClick={() =>  {
                        clearSessionStorage();
                        navigate(`/create-pickup?pickupReqId=${editData?.pickupReqId}`);
                      }}
                    >
                     Create Booking
                    </button>}
                    {id && <button
                      type="button"
                      className="h-[45px] px-4 bg-red-600 text-white font-semibold font-sansation rounded-lg min-w-[100px] transition duration-300"
                      onClick={() =>{ setIsCancelPickup(true)}}
                      disabled={loading}
                    >
                     Cancel
                    </button>}
                    
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <div className='p-[0.535rem] pb-4 hidden md:block'>
            <img src={PICKUP_IMG} alt="" className='w-full h-full object-contain' />
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default CreatePickupRequest;
