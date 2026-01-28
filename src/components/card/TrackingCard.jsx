import React, { useState } from 'react';
import CheckoutStepper from '../stepper/TrackingStepper';
import packageImage from "../../images/package_3d 1.png"
import toast from "react-hot-toast";

import request from '../../utils/request';
import { MdDelete } from "react-icons/md";
import PopupModal from '../../components/Modals/PopupModal';
import { FaRegEdit } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const TrackingCard = ({ data, status, onClick }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();
  const convertDateFormat = (dateToConvert) => {
    const date = new Date(dateToConvert);
    const options = { day: '2-digit', month: 'long' };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const formattedDate = formatter.format(date);
    return formattedDate;
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Confirmed':
        return {
          backgroundColor: '#D2FFEC',
          color: '#1BA169',
        };
      case 'InTransit':
        return {
          backgroundColor: '#fff8eb',
          color: '#f39d00',
        };
      case 'Scheduled':
        return {
          backgroundColor: "#eaf5ff",
          color: '#0089ff'
        }
      case 'PickupRequested':
        return {
          backgroundColor: "#e8fffa",
          color: '#00d5a4'
        }
      case 'DeliveryCompleted':
        return {
          backgroundColor: "#eaffef",
          color: '#10ff00'
        }
      case 'DeliveryFailed':
        return {
          backgroundColor: "#ffe8e8",
          color: "#d50000"
        }

      default:
        return {
          backgroundColor: '#FFF2E7',
          color: '#FF8A1E',
        };
    }
  };
  // Extract styles based on status
  const { backgroundColor, color } = getStatusStyles(status);

  const handleDeleteClick = (address) => {
    setSelectedAddressId(address);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = () => {
    request({
      url: `V1/customer/pickup-request/${data?.pickupReqId}`,
      method: 'DELETE',
    }).then((response) => {
      toast.success(response?.message || 'Pickup request deleted');
    }).catch((err) => {
      if (err.response?.status === 500) {
        toast.dismiss();
        toast.error(err.response.data.message);
      }
    });
    setIsConfirmModalOpen(false);
  };

  const handleModalClose = () => {
    setIsConfirmModalOpen(false);
    setSelectedAddressId(null); 
  };

  return (
    <div className="relative grid grid-cols-1 border rounded-md my-3 pt-4 cursor-pointer hover:shadow-lg overflow-hidden" onClick={onClick}>
      <div className="absolute right-0 top-0 flex items-center gap-1">
        <PopupModal isOpen={isConfirmModalOpen}
          onClose={handleModalClose}
          onConfirm={handleDelete}
          title="Delete Address"
          message={`Are you sure you want to delete ?`} />
        {/* Status background */}
        <div className="flex items-center">
          <div className="relative flex items-center">
            {status && (<p className="bold-sansation text-sm whitespace-nowrap h-8 flex items-center px-2" style={{ backgroundColor, color }}>{status}</p>)}

            {data?.isReversePickup && (
              <span className="mx-2 my-1 left-[-40px] border rounded-lg px-1 text-red-500">
                RP
              </span>
            )}
          </div>

          {/* Delete icon without background */}
          {/* {data?.Source === "PickupRequest" && (
            <MdDelete
              className="text-red-500 cursor-pointer ml-1 mr-2 h-8"
              size={24}
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmModalOpen(true);
              }}
            />
          )} */}
        </div>
      </div>

      <div className="grid grid-cols-12">
        <div className="hidden sm:block  ml-2">
          <div className=" rounded-full xl:w-3/4 border-2 border-custom-gray flex items-center justify-center">
            <img
              src={packageImage}
              alt="package"
              className="rounded-full p-1"
            />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-11 pl-2 xl:pl-0 position-relative ">
          <h5 className="bold-sansation">#{data?.Source === "Booking" ? data?.awbNumber : data?.pickupReqNo}</h5>
          <div className="flex gap-5 text-xs font-sansation font-regular text-[#ABABAB]">
            <p>{data?.bookingDate ? convertDateFormat(data?.bookingDate) : data?.scheduledDate ? convertDateFormat(data?.scheduledDate) : "-"}</p>
          </div>
          <div className=' mr-10 '>
            <CheckoutStepper stepsConfig={data?.statusHistory ? JSON?.parse(data?.statusHistory) : []} />
          </div>
          {/* {(data?.isBookingEditable && data?.Source === "Booking") && <span className='position-absolute ' onClick={(e) => { e.stopPropagation(); navigate(`/create-pickup?id=${data?.bookingId}`) }} style={{ right: "5px", bottom: "5px", position: "absolute" }}><FaRegEdit size={22} color='green' /></span>} */}
        </div>
      </div>
    </div>
  )
}

export default TrackingCard;