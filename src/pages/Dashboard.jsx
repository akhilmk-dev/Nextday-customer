import React, { useContext, useEffect, useState } from "react";
import tickIcon from "../images/Group 1171275539.png";
import packageImage from "../images/package_3d 1.png";
// import CheckoutStepper from "../components/stepper/TrackingStepper";
import TrackingCard from "../components/card/TrackingCard";
import { localCheckoutSteps } from "../utils//hardcodeddata/HardcodedData";
import { localCheckoutStepsData } from "../utils//hardcodeddata/HardcodedData";
import { useNavigate } from "react-router-dom";
import request from '../utils/request'
import toast from "react-hot-toast";
import FadeLoader from "react-spinners/FadeLoader";
import TrackingCard2 from "../components/card/TrackingCard2";

const Dashboard = () => {

  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [countsData, setCountsData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [bookingList, setBookingList] = useState([])
  const [sheduledPickups, setSheduledPickups] = useState([])


  const fetchCounts = () => {
    request({
      url: `/V1/customer/dashboard`,
      method: "GET"
    }).then((response) => {
      if (response?.data) {
        setCountsData(response?.data)
      }
    }).catch((error) => {
      if (error.response.status == 500) {
        toast.dismiss();
        toast.error(error.response.data.message)
      }
    })
  }

  const fetchBookingDetails = () => {
    setIsLoading(true)
    request({
      url: `V1/customer/bookings?&pageNumber=1&pageSize=5&status=All`,
      method: "GET"
    }).then((response) => {
      setBookingList(response?.data.slice(0, 2))
      setIsLoading(false)
    }).catch((err) => {
      setIsLoading(false)
      if (err.response.status == 500) {
        toast.dismiss();
        toast.error(err.response.data.message)
      }
    })
  }

  const fetchSheduledPickups = () => {
    setIsLoading(true)
    request({
      url: `V1/customer/bookings?&pageNumber=1&pageSize=5&status=scheduledpickup`,
      method: "GET"
    }).then((response) => {
      setSheduledPickups(response?.data.slice(0, 2))
      setIsLoading(false)
    }).catch((err) => {
      setIsLoading(false)
      if (err.response.status == 500) {
        toast.dismiss();
        toast.error(err.response.data.message)
      }
    })
  }

  useEffect(() => {
    fetchCounts();
    fetchBookingDetails();
    fetchSheduledPickups();
  }, [])

  let dashboardData = [
    { count: countsData[0]?.booked || 0, status: "Booked" },
    { count: countsData[0]?.inTransit || 0, status: "In Transit" },
    { count: countsData[0]?.completed || 0, status: "Completed" },
    { count: countsData[0]?.scheduled || 0, status: "Scheduled" },
  ];


  // const handleCardClick = (id) => {
  //   navigate(`/home/customer/details/${id}`);
  // };
  const handleCardClick = (data) => {
    const status = data?.Source?.toLowerCase();
    // console.log(status, "handle card")
  
    if (status === "pickuprequest") {
      navigate(`/create-pickup-request?id=${data?.pickupReqId}`);
    } else {
      // setCardClicked(true);
      navigate(`/home/customer/details/${data?.bookingId}`);
    }
  };
  

  const handleViewAllClick = () => {
    setShowAll(true)
  }

  // const dataToDisplay = showAll ? localCheckoutSteps : localCheckoutSteps.slice(0, 2);

  return (
    <div className="container mx-auto m-5">
      <div className="grid  grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardData?.map((item, index) => (
          <div
            key={index}
            className="grid  grid-cols-[70px_1fr] hover:shadow-md shadow rounded-md p-2 gap-2 cursor-pointer"
          >
            <div className="">
              <img
                src={tickIcon}
                alt="tick mark"
                width="65px"
                height="65px"
              />
            </div>
            <div className=" text-custom-green">
              <h1 className="text-3xl sm:text-3xl lg:text-4xl bold-sansation">{item.count}</h1>
              <p className="font-sansation font-regular" style={{ whiteSpace: "nowrap" }}>{item.status}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 font-sansation font-regular pt-10 ">
        <div>
          <p>Recent Shipments</p>
        </div>
        <div className="text-end">
          {!showAll && (
            <p
              className="cursor-pointer"
              onClick={() => navigate('/home/customer/my-bookings')}
            >
              View All
            </p>
          )}
        </div>
      </div>

      {bookingList?.map((stepData, index) => {
        const status = stepData?.bookingStatus || "";
        return <TrackingCard key={index} data={stepData} status={status} onClick={() => handleCardClick(stepData)} />;
      })}

      {((!bookingList && !isLoading) || (bookingList.length === 0 && !isLoading)) && <div style={{ height: "250px" }} className="flex items-center justify-center"><span>No Booking Found</span></div>}
      {isLoading && <div style={{ height: "250px" }} className="flex items-center justify-center"><FadeLoader
        color={"green"}
        loading={isLoading}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      /></div>}
      <div className="grid grid-cols-2 font-sansation font-regular pt-10 ">
        <div>
          <p>Sheduled Pickups</p>
        </div>
        <div className="text-end">
          <p className="cursor-pointer" onClick={() => navigate('/home/customer/scheduled-pickups')}>View All</p>
        </div>
      </div>

      {sheduledPickups?.map((stepData, index) => {
        const status = stepData?.status || "";
        return <TrackingCard key={index} data={stepData} status={status} />;
      })}
      {isLoading && <div style={{ height: "250px" }} className="flex items-center justify-center"><FadeLoader
        color={"green"}
        loading={isLoading}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      /></div>}
      {((!sheduledPickups && !isLoading) || (sheduledPickups.length === 0 && !isLoading)) && <div style={{ height: "250px" }} className="flex items-center justify-center"><span>No Pickups Found</span></div>}

    </div>
  );
};

export default Dashboard;
