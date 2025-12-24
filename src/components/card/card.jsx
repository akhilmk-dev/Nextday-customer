import React from "react";
import { FaArrowRight } from "react-icons/fa";

function Card({ title, description, icon, buttonText,onClick }) {
  return (
    <div className="bg-custom-gray rounded-lg shadow p-6  h-[18rem]">
      <div className="flex items-center mb-4">
        <img src={icon} alt={title} className="w-12 h-12" />
      </div>
      <h2 className="text-sm font-sansation font-bold mb-2">{title}</h2>
      <p className="font-sansation font-regular text-custom-blue text-base mb-5">{description}</p>
      <hr className="my-4 border-gray-300" />
      <button className="text-custom-green font-sansation font-bold pt-5" onClick={onClick}>
        <span className="flex items-center">
          <span className="mr-2">{buttonText}</span>
          <FaArrowRight />
        </span>
      </button>
    </div>
  );
}

export default Card;
