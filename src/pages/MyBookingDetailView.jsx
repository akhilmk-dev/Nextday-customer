import React, { useContext, useEffect, useState } from "react";
import deliveryBox from "../images/deliverybox.png";
import customerCare from "../images/customercare.png";
import request from '../utils/request'
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import MyGoogleMap from "../components/location/MyGoogleMap";
import FadeLoader from "react-spinners/FadeLoader";
import CheckoutStepper2 from "../components/stepper/TrackingStepper2";
import Button from "../components/button/Button";
import { Rating } from "@mui/material";
import RatingModal from "../components/Modals/RatingModal";
import Breadcrub from "../components/button/Breadcrub";
import { myContext } from "../utils/context_api/context";

const MyBookingDetailView = () => {
  const [bookingDetails, setBookingDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [rating, setRating] = useState(0);
  const { id } = useParams()
  const navigate = useNavigate();

  const fetchBookingDetails = () => {
    setIsLoading(true)
    request({
      url: `/V1/customer/booking/${id}`,
      method: "GET"
    }).then((response) => {
      if (response?.data) {
        setBookingDetails(response?.data[0])
      }
      setIsLoading(false)
    }).catch((error) => {
      setIsLoading(false)
      if (error.response.status == 500) {
        toast.dismiss();
        toast.error(error.response.data.message)
      }
    })
  }

  const handleReadyToPickup = () => {
    request({
      url: `/V1/customer/bookings/${id}/ready-for-pickup`,
      method: "PUT",
    }).then((response) => {
      toast.dismiss();
      toast.success(response.message)
      fetchBookingDetails();
    }).catch((error) => {
      if (error.response.status == 500) {
        toast.dismiss();
        toast.error(error.response.data.message)
      }
    })
  }

  useEffect(() => {
    fetchBookingDetails();
  }, [])

  const handleRatingSubmit = () => {
    if (rating > 0) {
      setIsRatingModalOpen(true)
    } else {
      toast.dismiss();
      toast.error("Please provide rating")
    }
  }

  const consignerAddress = bookingDetails?.consignerAddress
    ? JSON.parse(bookingDetails.consignerAddress)
    : [];

  const consignerLat = Number(consignerAddress[0]?.lat);
  const consignerLong = Number(consignerAddress[0]?.long);

  return (
    <>
      <div className="relative">
        <Breadcrub pageTitle="My Booking Details " />
        <button className="text-white bg-custom-green py-2 absolute top-1 right-2 px-5 rounded-md font-sansation" onClick={() => navigate(-1)}>Back</button>
      </div>
      {isLoading && <div className="flex justify-center items-center" style={{ minHeight: "300px" }}><FadeLoader
        color={"green"}
        loading={isLoading}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader" /></div>}
      {(!isLoading && bookingDetails) && <div>
        <div className="grid grid-cols-10 bg-black rounded-md items-center">
          <div className="flex p-2 justify-end items-center">
            <div className="w-3/4">
              <img src={deliveryBox} alt="deliverybox" />
            </div>
          </div>
          <div className=" col-start-2 col-end-8 p-2 ">
            <div className="flex gap-2 bold-sansation items-center">
              <h4 className="text-custom-white text-sm">#{bookingDetails?.awbNumber}</h4>
              <span className="bg-[#D9FFEF] text-custom-green  p-1 px-2 rounded-md text-xs">
                {bookingDetails?.bookingStatus}
              </span>
            </div>
            <p className="text-xs text-[#BDBDBD] font-sansation font-regular mt-2">
              Estimated Delivery Date : 01-06-2026
            </p>
          </div>
          <div className="col-start-8 col-end-11 px-5">
            <div className="flex items-center justify-center">
              <div className="w-1/6 mr-4">
                <img src={customerCare} alt="customer care executive" />
              </div>
              <div className="text-custom-white text-sm font-sansation font-regular">
                <p className="text-[#BDBDBD] ">Customer Care</p>
                <p>+91 77363 63692</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 py-5 ">
          <div>
            <MyGoogleMap latitude={consignerLat} longitude={consignerLong} />
            <div className="flex justify-end gap-2">
              {(bookingDetails?.canMarkPickupReady && bookingDetails?.bookingStatus =='PickupScheduled')&& <div className="flex justify-end"><Button type="button" buttonText="Ready to pickup" className="my-2" onClick={handleReadyToPickup} /> </div>}
              {/* {bookingDetails?.canMarkPickupReady && <div className="flex justify-end "><Button type="button" buttonText="Cancel Pickup" className="my-2 bg-gray-400 text-gray-900"/> </div>} */}
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1">
          <div><span className="text-xl bold-sansation">Your Package Status</span><span className="bg-[#D9FFEF] text-custom-green ms-2 p-1 px-2 rounded-md text-xs">
            {bookingDetails?.bookingStatus}
          </span></div>
          <CheckoutStepper2 stepsConfig={bookingDetails?.trackingHistory ? JSON.parse(bookingDetails?.trackingHistory) : []} />
        </div>

       {bookingDetails?.bookingStatus =='DeliveryCompleted' && <div className="mb-10 mt-3 mx-2">
          <h4 className="bold-sansation text-md">Rate Your Delivery Experience</h4>
          {bookingDetails?.canRate && <Rating name="size-large" defaultValue={rating || bookingDetails?.deliveryRating || 0} onChange={(e, value) => setRating(value)} size="large" className="mt-2" />}
          {bookingDetails?.canRate == 0 && <Rating name="size-large" defaultValue={rating || bookingDetails?.deliveryRating || 0} size="large" className="mt-2" />}
          {bookingDetails?.canRate && <Button type="button" buttonText="Submit & Continue" className="mt-2" onClick={handleRatingSubmit} />}
        </div>}

      </div>}
      {isRatingModalOpen && <RatingModal id={id} setRating={setRating} rating={rating || bookingDetails?.deliveryRating || 0} isRatingModalOpen={isRatingModalOpen} setIsRatingModalOpen={setIsRatingModalOpen} />}
      {(!isLoading && !bookingDetails) && <div className="flex justify-center items-center" style={{ minHeight: "300px" }}> <p>No Details Found</p> </div>}
    </>
  );
};

export default MyBookingDetailView;
