import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Breadcrub from '../components/button/Breadcrub';
import request from '../utils/request';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import FadeLoader from 'react-spinners/FadeLoader';
import { useNavigate } from 'react-router-dom';


const RecurringPickupList = () => {
    const [recurringList, setRecurringList] = useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fetchRecurringList = () => {
        setLoading(true)
        request({
            url: `V1/customer/recurring-pickup`,
            method: "GET"
        }).then((response) => {
            setRecurringList(response?.data)
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
            if (err.response.status == 500) {
                toast.dismiss();
                toast.error(err.response.data.message)
            }
        })
    }

    const weeks = [{ label: "Sun", value: "1" }, { label: "Mon", value: "2" }, { label: "Tue", value: "3" }, { label: "Wed", value: "4" }, { label: "Thu", value: "5" }, { label: "Fri", value: "6" }, { label: "Sat", value: "7" }]

    const convertTimeToAMPM = (dateToConvert) => {
        const date = new Date(dateToConvert);
        // Extract hours and minutes
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        // Determine AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; 
        const time = `${hours}:${minutes} ${period}`;

        return time;
    };

    const convertDateFormat = (dateToConvert) => {
        const date = new Date(dateToConvert);
        const options = { day: '2-digit', month: 'long' };
        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const formattedDate = formatter.format(date);
        return formattedDate;
    }

    useEffect(() => {
        fetchRecurringList();
    }, []);

    const handleEdit = (id)=>{
        navigate(`/home/customer/create-recurring-pickup?id=${id}`);
    }

    const handleDelete = async(id)=>{
        request({
            url: `V1/customer/recurring-pickup/${id}`,
            method: "DELETE"
        }).then((response) => {
            toast?.dismiss();
            toast.success(response?.message)
        }).catch((err) => {
            if (err.response.status == 500) {
                toast.dismiss();
                toast.error(err.response.data.message)
            }
        })
    }

    return (
        <div className='mb-3'>
            <div className="relative">
                <Breadcrub pageTitle="Recurring Pickups" />
            </div>
            <div className="flex flex-col gap-2 max-h-[510px] mt-5 overflow-auto">
                {recurringList?.map(item => (
                    <>
                        <div className='border rounded p-2 '>
                            <div className='flex justify-between'>
                                <h2 className='font-sansation text-xl text-green-600'>{item?.frequency}</h2>
                                <div className='flex justify-center items-center gap-3'>
                                    <FaEdit color='green' size={20} title='Edit' style={{cursor:"pointer"}} onClick={()=>handleEdit(item?.recurringId)}/>
                                    <MdDelete color='red' size={20} title="Delete" style={{cursor:"pointer"}} onClick={()=>handleDelete(item?.recurringId)}/>
                                </div>
                            </div>
                            <div className='flex justify-between gap-3 sm:items-center flex-wrap mt-2'>
                                <div>
                                    <p className='font-sansation text-gray-400'>sheduledPickup Time</p>
                                    <p className='font-sansation'>{convertTimeToAMPM(item?.pickupScheduleFrom)} to {convertTimeToAMPM(item?.pickupScheduleTo)}</p>
                                </div>

                                {(item?.frequency == "Monthly" && item?.monthlyDate) && <div>
                                    <p className='font-sansation text-gray-400'>Date</p>
                                    <p className='font-sansation'>{convertDateFormat(item?.monthlyDate)}</p></div>}

                                {(item?.frequency == "Weekly" && item?.weeklyDay) && <div>
                                    <p  className='font-sansation text-gray-400'>Days</p>
                                    <div className='font-sansation mt-2'>
                                        {weeks?.filter(day => item?.weeklyDay?.split(',')?.includes(day?.value))?.map(item2 => (
                                            <span className='font-sansation p-1  border rounded me-2'>{item2?.label}</span>
                                        ))}
                                    </div>
                                </div>}

                                <div>
                                    <p className='font-sansation text-gray-400'>Actual Weight</p>
                                    <p className='font-sansation'>{item?.approxWeight}</p>
                                </div>
                            </div>

                        </div>
                    </>
                ))}
                {loading && <div className='min-h-[600px] flex justify-center items-center'><FadeLoader color='#1ba169' size={40} /></div>}
                {(recurringList?.length <= 0 && !loading) && <div className='min-h-[600px] flex items-center justify-center'><p>No Recurring Pickups Found</p></div>}
            </div>
        </div>
    )
}

export default RecurringPickupList