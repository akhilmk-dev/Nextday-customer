import { useGlobalFormik } from '../utils/custom-hooks/formik-hook/useGlobalFormik';
import CustomInputField from '../components/input-field/CustomInput';
import { recurringInitialValues, recurringSchema } from '../utils/validation-schema/auth-schema/authSchema';
import Button from '../components/button/Button';
import { FaLocationDot } from 'react-icons/fa6';
import { convertToDateInputFormat, convertToTimeInputFormat, fetchAddressList } from '../utils/helpers';
import { myContext } from '../utils/context_api/context';
import SearchInput from '../components/input-field/SearchInput';
import { CiSearch } from "react-icons/ci";
import toast from 'react-hot-toast';
import { useContext, useEffect, useState } from 'react';
import request from '../utils/request';
import Breadcrub from '../components/button/Breadcrub';
import ClipLoader from "react-spinners/ClipLoader";
import { useLocation, useNavigate } from 'react-router-dom';
import Switch from 'react-switch';

import { IoMdClose } from "react-icons/io";

const CreateRecurringPickup = () => {
    const { addressList, setAddressList } = useContext(myContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMap, setErrorMap] = useState({});
    const [frequency, setFrequency] = useState(""); // Add state for frequency
    const [monthlyDate, setMonthlyDate] = useState();
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    const formik = useGlobalFormik(recurringInitialValues, recurringSchema, (values) => {
        if (!addressId) {
            toast.dismiss();
            toast.error("Please select an address");
            return false;
        } else if (frequency === "Weekly" && formik.values?.weeklyDay?.length <= 0) {
            toast.error("Please select at least one weekday");
            return false;
        } else if (frequency == "Monthly" && !monthlyDate) {
            return false;
        } else {
            setLoading(true)
            if (editData) {
                request({
                    url: `/V1/customer/recurring-pickup`,
                    method: "PUT",
                    data: {
                        "recurringId": editData?.recurringId,
                        "consignerId": addressId,
                        "pickupScheduleFrom": values?.pickupScheduleFrom,
                        "pickupScheduleTo": values?.pickupScheduleTo,
                        "approxWeight": values?.approxWeight,
                        "frequency": values?.frequency,
                        "weeklyDay": values.weeklyDay?.join(","),
                        "monthlyDate": values.monthlyDate,
                        "isActive": values?.isActive
                    }
                }).then((response) => {
                    toast.dismiss();
                    toast.success(response.message);
                    setLoading(false)
                    formik.resetForm();
                    navigate(`/home/customer/list-recurring-pickup`);
                }).catch((error) => {
                    setLoading(false)
                    if (error.response.status === 400) {
                        const errormap = error.response.data.errors.reduce((acc, error) => {
                            acc[error.path] = error.msg;
                            return acc;
                        }, {});
                        setErrorMap(errormap);
                    }
                    if (error.response.status === 500) {
                        toast.dismiss();
                        toast.error(error.response.data.message);
                    }
                });
            } else {
                request({
                    url: `/V1/customer/recurring-pickup`,
                    method: "POST",
                    data: {
                        // "recurringId": 1,
                        "consignerId": 88,
                        "pickupScheduleFrom": values?.pickupScheduleFrom,
                        "pickupScheduleTo": values?.pickupScheduleTo,
                        "approxWeight": values?.approxWeight,
                        "frequency": values?.frequency,
                        "weeklyDay": values.weeklyDay?.join(","),
                        "monthlyDate": values.monthlyDate,
                        "isActive": values?.isActive
                    }
                }).then((response) => {
                    toast.dismiss();
                    toast.success(response.message);
                    setLoading(false)
                    formik.resetForm();
                    navigate(`/home/customer/list-recurring-pickup`)
                }).catch((error) => {
                    setLoading(false)
                    if (error.response.status === 400) {
                        const errormap = error.response.data.errors.reduce((acc, error) => {
                            acc[error.path] = error.msg;
                            return acc;
                        }, {});
                        setErrorMap(errormap);
                    }
                    if (error.response.status === 500) {
                        toast.dismiss();
                        toast.error(error.response.data.message);
                    }
                });
            }
        }
    });

    const fetchEditData = async () => {
        request({
            url: `V1/customer/recurring-pickup/${id}`,
            method: "GET"
        }).then((response) => {
            setEditData(response?.data?.[0])
        }).catch((err) => {
            if (err.response.status == 500) {
                toast.dismiss();
                toast.error(err.response.data.message)
            }
        })
    }

    useEffect(() => {
        if (id) {
            fetchEditData();
        }
    }, [id])

    useEffect(() => {
        if (editData) {
            formik.setFieldValue('frequency', editData?.frequency || '');
            setFrequency(editData?.frequency);
            formik.setFieldValue('pickupScheduleFrom', convertToTimeInputFormat(editData?.pickupScheduleFrom) || '');
            formik.setFieldValue('pickupScheduleTo', convertToTimeInputFormat(editData?.pickupScheduleTo) || '');
            formik.setFieldValue('weeklyDay', editData.frequency === "Weekly" ? editData?.weeklyDay?.split(",") : []);
            formik.setFieldValue('monthlyDate', editData.frequency == "Monthly" ? convertToDateInputFormat(editData?.monthlyDate) : "");
            setMonthlyDate(convertToDateInputFormat(editData?.monthlyDate));
            formik.setFieldValue('approxWeight', editData?.approxWeight || '');
            formik.setFieldValue('isActive', editData?.isActive || false);
            setAddressId(editData?.consignerId || '');
        }
    }, [editData]);


    useEffect(() => {
        fetchAddressList(setAddressList);
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFrequencyChange = (e) => {
        setFrequency(e.target.value);
        formik.setFieldValue("frequency", e.target.value);
    };

    const handleSwitchChange = (nextChecked) => {
        formik.setFieldValue('isActive', nextChecked);
    };

    const weeks = [{ label: "Sun", value: "1" }, { label: "Mon", value: "2" }, { label: "Tue", value: "3" }, { label: "Wed", value: "4" }, { label: "Thu", value: "5" }, { label: "Fri", value: "6" }, { label: "Sat", value: "7" }]

    const [addressId, setAddressId] = useState('');

    return (
        <div>
            <div className="relative">
                <Breadcrub pageTitle={editData ? "Update Recurring Pickup" : "Create Recurring Pickup"} />
            </div>
            <div className='py-5 px-4 bg-custom-light-blue mb-4'>
                <form action="" onSubmit={formik.handleSubmit} >
                    {/* <h2 className='text-center font-sansation font-regular bold-sansation text-xl'>{editData ? "Update Recurring Pickup" : "Create Recurring Pickup"}</h2> */}
                    <div className='grid grid-cols-1 md:grid-cols-[2fr_1.5fr] gap-2 sm:gap-4'>
                        <div className='my-2 sm:my-4'>
                            <label htmlFor="" className="font-sansation font-regular text-md">Select Address<span className="text-red-500"> *</span></label>
                            <div className='relative my-2 sm:w-1/2'>
                                <SearchInput className='w-full py-1 border-gray-200 h-[45px] sm:w-full' iconSize={25} placeholder='Search Address' onChange={handleSearch} Icon={CiSearch} value={searchQuery} />
                                {searchQuery && (
                                    <IoMdClose
                                        className='absolute top-1/2 right-8 transform -translate-y-1/2 text-lg cursor-pointer'
                                        onClick={() => handleSearch({ target: { value: '' } })}
                                        title="Clear"
                                    />
                                )}
                            </div>
                            <div className=' ' style={{ maxHeight: '320px', minWidth: "250px", overflowY: 'auto', cursor: 'pointer' }} >
                                {addressList.filter(address => address?.addressLabel?.toLowerCase().includes(searchQuery.toLowerCase())).map((item, index) => (
                                    <div key={index} className={`flex items-center border border-gray-200 rounded-md my-2 py-3 pe-3 relative ${String(addressId) === String(item.addressId) ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'}`} style={{ minWidth: "280px" }} onClick={() => setAddressId(addressId === item.addressId ? null : item.addressId)}
                                    >
                                        <div className='p-4 ms-3 rounded-full bg-white shadow-lg'>
                                            <FaLocationDot className='text-2xl text-custom-green' />
                                        </div>
                                        <div className='ms-3 py-3 px-2' style={{ minWidth: "180px" }}>
                                            <h3 className=' bold-sansation'>{item.addressLabel}</h3>
                                            <p className='font-sansation font-regular text-sm' style={{ minWidth: "180px" }}>{item?.addressLine1 + ',' + item?.addressLine2 + ',' + item?.cityName + ',' + item?.stateName + ',' + item?.countryName}</p>
                                        </div>
                                    </div>
                                ))}
                                {addressList.filter(address => address?.addressLabel?.toLowerCase().includes(searchQuery.toLowerCase())).length <= 0 && <div className='flex justify-center items-center' style={{ minHeight: "320px" }}><p>No Address Found</p></div>}
                            </div>
                        </div>

                        <div className='sm:mt-4'>
                            <div className='mt-1'>
                                <label htmlFor="" className='font-sansation font-regular text-md'>Frequency<span className="text-red-500"> *</span></label>
                                <select value={formik?.values?.frequency} name="frequency" onChange={handleFrequencyChange} className='border-none border-gray-200 outline-none w-full font-sansation font-regular text-sm border h-[45px] px-2 rounded-lg mt-2'>
                                    <option value="">Select frequency</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                                {(formik.errors.frequency && !formik.values?.frequency) && <div className="invalid-feedback text-red-500 text-sm">{formik.errors?.frequency}</div>}
                                <span id="frequency" className="text-red-500">
                                    {errorMap['frequency']}
                                </span>
                            </div>

                            {frequency === "Weekly" && (
                                <div className='mt-2'>
                                    <label htmlFor="weeklyDay" className="font-sansation font-regular text-md">Select Days<span className="text-red-500"> *</span></label>
                                    <div className="grid grid-cols-7 gap-2 mt-2">
                                        {weeks.map((day, index) => (
                                            <span
                                                key={index}
                                                className={`flex justify-center items-center p-2 rounded-sm cursor-pointer 
                                                ${formik.values.weeklyDay?.includes(day?.value) ? 'bg-[#1ba169] text-white border-[#1ba169]' : 'bg-white text-black border-gray-300'} 
                                                          border-2 transition-all duration-300 ease-in-out`}
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevent checkbox input's default behavior
                                                    const updatedDays = formik.values.weeklyDay?.includes(day?.value)
                                                        ? formik.values.weeklyDay.filter(d => d !== day?.value)
                                                        : [...formik.values.weeklyDay, day?.value];
                                                    formik.setFieldValue("weeklyDay", updatedDays);
                                                    // setWeeklyDay(updatedDays);
                                                }}
                                            >
                                                {day?.label}
                                            </span>
                                        ))}
                                    </div>
                                    {formik.values?.weeklyDay?.length <= 0 && <span className='text-red-500'>Please select atleast one day</span>}
                                </div>
                            )}

                            {frequency === "Monthly" && (
                                <div className='mt-2'>
                                    <label htmlFor="monthlyDate" className="font-sansation font-regular text-md">Select Day of Month<span className="text-red-500"> *</span></label>
                                    <input
                                        type="date"
                                        name="monthlyDate"
                                        value={monthlyDate ? monthlyDate : formik?.values?.monthlyDate}
                                        onChange={(e) => { formik.setFieldValue('monthlyDate', e.target.value); setMonthlyDate(e.target.value) }}
                                        className="border border-gray-200 outline-none w-full font-sansation font-regular text-sm h-[45px] px-2 rounded-lg mt-2"
                                    />
                                    {!formik.values.monthlyDate && <div className="invalid-feedback text-red-500 text-sm">This field is required</div>}
                                </div>
                            )}

                            <div className="mt-1">
                                <CustomInputField
                                    type="number"
                                    name="approxWeight"
                                    placeholder="Enter actual weight"
                                    title="Approx Weight"
                                    value={formik.values?.approxWeight}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.errors?.approxWeight}
                                    touched={formik.touched?.approxWeight}
                                    isMandatory={true}
                                />
                                <span id="approxWeight" className="text-red-500">
                                    {errorMap['approxWeight']}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                                <div className="mt-1">
                                    <label htmlFor="" className="font-sansation font-regular text-md">Pickup Schedule From<span className="text-red-500"> *</span></label>
                                    <input
                                        type="time"
                                        name="pickupScheduleFrom"
                                        id="pickupScheduleFrom"
                                        value={formik.values?.pickupScheduleFrom}
                                        className="border border-gray-200 outline-none w-full font-sansation font-regular text-sm px-2 rounded-lg h-[45px] mt-2 mb-2"
                                        onChange={formik.handleChange}
                                    />
                                    {(formik.errors.pickupScheduleFrom && formik.touched.pickupScheduleFrom) && <div className="invalid-feedback text-red-500 text-sm">{formik.errors?.pickupScheduleFrom}</div>}
                                    <span id="pickupScheduleFrom" className="text-red-500">
                                        {errorMap['pickupScheduleFrom']}
                                    </span>
                                </div>
                                <div className="mt-1">
                                    <label htmlFor="" className="font-sansation font-regular text-md">Pickup Schedule To<span className="text-red-500"> *</span></label>
                                    <input
                                        type="time"
                                        name="pickupScheduleTo"
                                        id="pickupScheduleTo"
                                        value={formik.values?.pickupScheduleTo}
                                        className="border border-gray-200 outline-none w-full font-sansation h-[45px] font-regular text-sm px-2 rounded-lg mt-2 mb-2"
                                        onChange={formik.handleChange}
                                    />
                                    {(formik.touched.pickupScheduleTo && formik.errors.pickupScheduleTo) && <div className="invalid-feedback text-red-500 text-sm">{formik.errors?.pickupScheduleTo}</div>}
                                    <span id="pickupScheduleTo" className="text-red-500">
                                        {errorMap['pickupScheduleTo']}
                                    </span>
                                </div>
                                <div className='mt-1 flex items-center gap-2'>
                                    <label htmlFor="isActive" className="font-sansation font-regular text-md">Is Active</label>
                                    <Switch
                                        id="isActive"
                                        name='isActive'
                                        checked={formik.values?.isActive}
                                        onChange={handleSwitchChange}
                                        onColor="#4CAF50"
                                        offColor="#ccc"
                                        handleDiameter={18}
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        width={50}
                                        height={24}
                                        borderRadius={12}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center items-center">
                        <button className='bg-custom-green text-white flex items-center  justify-center rounded-md font-sansation font-regular mt-4 px-5 h-[45px]' onClick={() => setErrorMap({})} >{loading ? <ClipLoader size={18} color='white' /> : `${editData ? "Update" : "Submit"}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateRecurringPickup;
