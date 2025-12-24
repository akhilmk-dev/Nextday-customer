import React from "react";

const ToggleButton = ({
  checked,
  onChange,
  className,
  inputClassName,
  toggleClassName,
}) => {
  return (
    <label
      className={`inline-flex items-center me-5 mt-2 cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        value=""
        className={`sr-only peer ${inputClassName}`}
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`relative w-11 h-6 
          rounded-full
          bg-orange-500 peer-checked:bg-custom-green
          border border-gray-300
          peer-focus:ring-4 peer-focus:ring-custom-green
          after:content-[''] after:absolute after:top-0.5 after:left-[2px]
          after:bg-white after:border-gray-300 after:border after:rounded-full
          after:h-5 after:w-5 after:transition-all
          peer-checked:after:translate-x-full peer-checked:after:border-white
          ${toggleClassName}`}
      />
    </label>
  );
};

export default ToggleButton;
