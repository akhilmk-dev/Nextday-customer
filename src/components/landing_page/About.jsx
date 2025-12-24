import React from "react";
import delivery from "../../images/8 172625243.png";
import baground from "../../images/Background.png";
import logo from "../../images/main-logo 1.png";
import cargo from "../../images/about-img.jpg";
import crain from "../../images/10.png.png";
import tracking from "../../images/11.png.png";
import { FaArrowRight } from "react-icons/fa";
import Button from "../button/Button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate()
  return (
    <>
      {/* ---------------- main div ------------------ */}
      <div
        style={{
          backgroundImage: `url(${baground})`,
        }}
        className=" bg-cover bg-center bg-no-repeat "
      >

        {/* -------------------- sub div ------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 container mx-auto sm:p-0 md:p-0 lg:p-0 p-[0.535rem]   mx-10 ">
          {/* ---------- delivery image ---------- */}
          <div className=" grid-col-span-1">

            <img src={delivery} alt="delivery" />

          </div>
          {/* ---------- delivery image end ---------- */}

          {/* ---------------- about content --------------- */}
          <div className="  grid-col-span-1 ">
            {/* <div className="flex gap-2  items-center mt-10 ">
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
            </div> */}
            {/* ---------- about paragragph ------------ */}
            <div className="mt-5">
              <strong className="text-4xl font-sansation font-bold inline-block ">
                {" "}
                Logistics Solutions That Deliver Excellence
              </strong>
              <p className="pt-3 font-sansation font-regular text-custom-blue ">
                Trackon is proud to have a can-do attitude backed up by 17
                years of experience. Embarking on a journey in 2002 with only
                two offices in Delhi & Mumbai, we have spread our unstoppable
                presence across the country. We are humbled by our phenomenal
                success with a turnover of more than 240 crores (FY
                2018-2019).
              </p>
            </div>
            {/* ---------- about paragragph end ------------ */}

            {/* ------------- cargo images and pargrphs ------------- */}
            <div className="container mx-auto pt-4 ">
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-[30px]">
                <div className="" style={{ position: "relative" }}>
                  <img src={cargo} alt="Cargo containers" className="w-full h-[250px]" />
                  <div className="absolute top-0 flex justify-center items-center w-full h-[250px]" >
                    <div>
                      <h2 className="text-8xl font-bold text-center font-sansation font-regular text-white" >5+</h2>
                      <h2 className="text-3xl font-bold text-white font-sansation font-regular mt-2">Years Experience</h2>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <img src={crain} alt="Crain icon" className="w-8 h-8" />
                      <h3 className="text-lg font-sansation font-bold">
                        Reverse logistics
                      </h3>
                    </div>
                    <p className="text-gray-700 font-sansation font-regular text-custom-blue">
                      This involves managing the Process of receiving
                    </p>
                  </div>
                  <div className="m-3">
                    <hr className=" border border-2 border-gray-300" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={tracking}
                        alt="Delivery track icon"
                        className="w-10 h-10"
                      />
                      <h3 className="text-lg font-sansation font-bold">
                        Tracking and visibility
                      </h3>
                    </div>
                    <p className="text-gray-700 font-sansation font-regular text-custom-blue">
                      This involves managing the Process of receiving
                    </p>
                  </div>
                </div>
                <div className="my-5 ">

                  <Button onClick={()=>navigate('/services')} buttonText="Load more" icon={<FaArrowRight />} className="w-[10.6rem]" />
                </div>
              </div>
            </div>
            {/* ------------- cargo images and pargrphs end ------------- */}
          </div>
          {/* ---------------- about content  end here --------------- */}
        </div>
        {/* -------------------- sub div end here ------------------ */}
        {/* ---------------- main div end here ------------------ */}
      </div>
    </>
  );
};

export default About;
