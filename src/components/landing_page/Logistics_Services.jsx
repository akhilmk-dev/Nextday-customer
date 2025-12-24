import React from "react";
import logo from "../../images/main-logo 1.png";
import Card from "../card/card";
import location from "../../images/image 73.png";
import van from "../../images/image 76.png";
import checkbox from "../../images/image 74.png";
import aeroplane from "../../images/image 75.png";
import { FaArrowRight } from "react-icons/fa";
import Button from "../button/Button";
import { Navigate, useNavigate } from "react-router-dom";

const Logistics_Services = () => {
  const navigate = useNavigate()
  // ------------------- data for cards ------------------
  const data = [
    {
      title: "PRIME TRACK",
      description: "Phasellus placerat dui sed metus luctus, vel hendrerit",
      icon: location,
      buttonText: "READ MORE",
    },
    {
      title: "EXPRESS STANDARD",
      description: "Phasellus placerat dui sed metus luctus, vel hendrerit",
      icon: checkbox,
      buttonText: "READ MORE",
    },
    {
      title: " AIR EXPRESS CARGO",
      description: "Phasellus placerat dui sed metus luctus, vel hendrerit",
      icon: aeroplane,
      buttonText: "READ MORE",
    },
    {
      title: " SURFACE EXPRESS CARGO",
      description: "Phasellus placerat dui sed metus luctus, vel hendrerit",
      icon: van,
      buttonText: "READ MORE",
    },
  ];
  // ------------------- data for cards end  ------------------

  return (
    <>
      <div className="  container mx-auto py-[2.5rem]">
        {/* ---------------- heading component ------------------- */}
        {/* <div className="grid grid-cols-1  justify-items-center md:justify-items-start lg:justify-items-start xl:justify-items-start md:px-12 lg:px-0 xl:px-5 mx-5">
          <div className="grid-col-1  flex gap-2 items-center  ">
            <div>
              <div className="relative">
                <hr className="w-[1.25rem] h-1 my-1 border-custom-green border-t-2  dark:border-custom-green ml-auto" />
                <hr className="w-[2.5rem] h-1 my-1 border-custom-green border-t-2  dark:border-custom-green" />
              </div>
            </div>
            <div>
              <h1 className="text-custom-green font-sansation font-bold text-xl ">
                About
              </h1>
            </div>
            <div className="w-[7rem]">
              <img src={logo} alt="logo" />
            </div>
          </div>
        </div> */}
        {/* ---------------- heading component end  ------------------- */}

        {/* ---------------- service section ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 xl:px-5 mx-5">
          <div className="grid-col-1 pt-4  md:text-center lg:text-left xl:text-left text-center">
            <p className="text-4xl font-sansation font-bold">
              Popular Logistics Services
            </p>
          </div>

          <div className="grid-col-1 mt-3 flex justify-end items-center ">
            <Button
              buttonText="All Services"
              icon={<FaArrowRight />}
              className="w-[10rem]"
              onClick={()=>navigate('/services')}
            />
          </div>
        </div>

        {/* ---------------- service section end ---------------- */}
        {/* ------------------- card content start here ------------------ */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5 my-10  justify-items-center">
          {data?.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              buttonText={item.buttonText}
              onClick={()=>navigate('/services')}
            />
          ))}
        </div>
        {/* ------------------- card content end here ------------------ */}
      </div>
    </>
  );
};

export default Logistics_Services;
