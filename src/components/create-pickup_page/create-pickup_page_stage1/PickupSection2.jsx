import React, { useState, useRef, useEffect } from "react";
import { MdDelete, MdInfo, MdUpload } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import uploads from "../../../images/upload.png";
import { FaPlus } from "react-icons/fa6";
import Select from 'react-select';
import ToggleButton from "../../button/ToggleButton";
import UnitField from "../../input-field/UnitField";
import CustomInputField from "../../input-field/CustomInput";
import { MdLockOpen } from "react-icons/md";
import { MdLockOutline } from "react-icons/md";

const PickupSection2 = ({ formik, setSkip, skip, imagePreviews, setImagePreviews, packages, setPackages,setNoOfBoxes,setIsAllSame,noOfBoxes,isAllSame }) => {
  const fileInputRefs = useRef([]);
  const [indexNo, setIndexNo] = useState();
  const [repeatItem, setRepeatItem] = useState({});

  const calculateVolumetricWeight = (index) => {
    const length = formik.values.packages[index]?.boxLength || 0;
    const breadth = formik.values.packages[index]?.boxBreadth || 0;
    const width = formik.values.packages[index]?.boxWidth || 0;
    const volumetricWeight = (length * breadth * width) / 5000;
    formik.setFieldValue(`packages[${index}].volumetricWeight`, volumetricWeight.toFixed(2));
  };

  useEffect(() => {
    if (indexNo !== undefined) {
      calculateVolumetricWeight(indexNo);
    }
  }, [formik.values.packages[indexNo]?.boxLength, formik.values.packages[indexNo]?.boxBreadth, formik.values.packages[indexNo]?.boxWidth]);

  const handleDimensionChange = (e, index, dimension) => {
    formik.setFieldValue(`packages[${index}].${dimension}`, e.target.value);
    calculateVolumetricWeight(index);
    setIndexNo(index);
  };

  const handleFileChange = (e, index, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        formik.setFieldValue(`packages[${index}].${fieldName}Name`, file.name);
        formik.setFieldValue(`packages[${index}].${fieldName}`, base64String);
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  };

  const handleToggle = (index) => {
    formik.setFieldValue(`packages[${index}].withInvoice`, !formik.values.packages[index].withInvoice);
  };

  const handleImageFileChange = (e, packageIndex) => {
    const files = Array.from(e.target.files);
    const newPreviews = [...imagePreviews];
    const newImages = [...(formik.values.packages[packageIndex]?.images || [])];

    if (!newPreviews[packageIndex]) {
      newPreviews[packageIndex] = []; // Ensure we have an array for the specific package index
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        newPreviews[packageIndex].push(base64String); // Push the base64 string to the correct package index
        newImages.push({ imageUrl: base64String }); // Save image object to images array
        formik.setFieldValue(`packages[${packageIndex}].images`, newImages); // Update Formik values
        setImagePreviews(newPreviews); // Update the previews state
      };
      reader.readAsDataURL(file);
    });
  };
  const options2 = [
    // { value: "dox", label: "Dox" },
    { value: "non-dox", label: "Non Dox" }
  ];
  const addNewPackage = (index) => {
    const newPackage = formik.values.packages[index]?.lock
      ? {
        boxWidth: formik.values.packages[index]?.boxWidth || '',
        boxLength: formik.values.packages[index]?.boxLength || '',
        boxBreadth: formik.values.packages[index]?.boxBreadth || '',
        volumetricWeight: formik.values.packages[index]?.volumetricWeight || '',
        approxWeight: formik.values.packages[index]?.approxWeight || '',
        packageValue: formik.values.packages[index]?.packageValue || '',
        boxDescription: formik.values.packages[index]?.boxDescription || '',
        packageNumber: formik.values.packages[index].packageNumber || "",
        ewaybillNo:formik.values.packages[index]?.ewaybillNo || "",
        withInvoice: false,
        images: [],
        lock: false,
      }
      : { withInvoice: false, images: [] };

    const updatedPackages = [...formik.values.packages, newPackage];
    setPackages(updatedPackages);
    setImagePreviews([...imagePreviews, []]);

    // Make sure Formik knows about the new fields
    formik.setFieldValue("packages", updatedPackages);
  };
  // useEffect(()=>{
  //   console.log(packages , "packages")
  // },[packages])

  // const removePackage = (index) => {
  //   const updatedPackages = packages.filter((_, i) => i !== index);
  //   const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
  //   setPackages(updatedPackages);
  //   setImagePreviews(updatedPreviews);
  // };

  const removePackage = (index) => {
    const updatedPackages = [...formik.values.packages];
    updatedPackages.splice(index, 1); // Remove package

    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1); // Remove image preview

    setPackages(updatedPackages);
    setImagePreviews(updatedPreviews);

    // Remove touched fields related to that package
    const newTouched = { ...formik.touched };
    const newErrors = { ...formik.errors };

    delete newTouched.packages?.[index];
    delete newErrors.packages?.[index];

    // Reindex touched/errors to match new indexes
    if (formik.touched.packages) {
      newTouched.packages = formik.touched.packages.filter((_, i) => i !== index);
    }
    if (formik.errors.packages) {
      newErrors.packages = formik.errors.packages.filter((_, i) => i !== index);
    }
    formik.setTouched(newTouched);
    formik.setErrors(newErrors);
    formik.setFieldValue("packages", updatedPackages);
    // Save clean state to session
    debounceSessionSave("package", {
      ...formik.values,
      packages: updatedPackages,
    });
  };

  const removeImage = (packageIndex, imageIndex) => {
    const updatedImages = formik.values.packages[packageIndex].images.filter((_, i) => i !== imageIndex);
    const updatedPreviews = [...imagePreviews];
    updatedPreviews[packageIndex] = updatedPreviews[packageIndex].filter((_, i) => i !== imageIndex);
    formik.setFieldValue(`packages[${packageIndex}].images`, updatedImages);
    setImagePreviews(updatedPreviews);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleImageFileChange({ target: { files } }, index);
  };

  return (
    <div className="container mx-auto">
      <div className="p-5 m-5 border rounded-md border-bg-custom-gray">
        <div className="font-sansation items-center">
          <h3 className="bold-sansation text-2xl">Box Details</h3>
          <div className="flex flex-wrap  gap-3 items-center" style={{ marginTop: "10px" }}>
            {/* Box Type */}
            <div className="">
            <label className="font-sansation font-regular text-md">
              Box Type<span className="text-red-500"> *</span>
            </label>

            <Select
              options={options2}
              placeholder="Select"
              name="boxType"
              value={options2.find(
                (option) => option?.value === formik.values?.boxType
              )}
              onChange={(option) =>
                formik.setFieldValue("boxType", option?.value)
              }
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: "45px",
                  width:"100%",
                  minWidth:"200px",
                  height: "45px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  fontSize: "14px",
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: "14px",
                }),
              }}
              onBlur={() => formik.setFieldTouched("boxType", true)}
              isClearable
            />

            {formik.touched.boxType && formik.errors.boxType && (
              <span className="text-[#FF0000] text-sm">
                {formik.errors.boxType}
              </span>
            )}
            </div>
            {/* No of Boxes */}
            <div >
              <label className="font-sansation font-regular text-md">
                No. of Boxes<span className="text-red-500"> *</span>
              </label>
              <input
                type="number"
                name="noOfBoxes"
                placeholder="Enter number of boxes"
                className="w-full mt-[10px] h-[45px] rounded-lg border px-3 text-sm"
                value={noOfBoxes}
                onChange={(e)=>setNoOfBoxes(e.target.value)}
                onBlur={formik.handleBlur}
                min={1}
              />
              {formik.touched.noOfBoxes && formik.errors.noOfBoxes && (
                <span className="text-[#FF0000] text-sm">
                  {formik.errors.noOfBoxes}
                </span>
              )}
            </div>
            {/* Are all boxes identical */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="identicalBoxes"
                name="identicalBoxes"
                checked={isAllSame}
                onChange={(e) =>
                  setIsAllSame(e.target.checked)
                }
                className="w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="identicalBoxes"
                className="font-sansation text-sm cursor-pointer"
              >
                Are all boxes identical?
              </label> 
            </div>
          </div>

          {/* <div className="items-center flex mt-1 mx-5">
            <div>
              <div className="flex gap-2 relative">
                <h5 className="bold-sansation">Skip</h5>
                <div className="group">
                  <MdInfo className="text-[#FFE603]" />
                  <div className="absolute hidden group-hover:block bg-[#9A9A9A] pt-3 text-custom-white text-sm px-2 py-1 rounded-md w-48 top-1/2 transform -translate-y-1/2 mx-8 ">
                    Skip the Box details
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2">
                      <svg className="w-4 h-10 text-[#9A9A9A]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <ToggleButton checked={skip} onChange={() => setSkip((prev) => !prev)} className="my-checkbox" inputClassName="my-input" toggleClassName="my-toggle" />
            </div>
          </div> */}
        </div>

        {(
          <div>
            {packages?.map((pkg, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                <div className="py-3">
                  <h5 className="bold-sansation mt-3">Box Dimensions<span className="text-red-500"> *</span></h5>
                  <div className="flex w-full items-center flex-col sm:flex-row sm:gap-4 py-2">
                    <div className="flex justify-center">
                      <UnitField
                        placeholder="Width"
                        unit="CM"
                        name={`packages[${index}].boxWidth`}
                        value={formik.values.packages[index]?.boxWidth}
                        onChange={(e) => handleDimensionChange(e, index, 'boxWidth')}
                        onBlur={formik.handleBlur}
                        error={formik.errors.packages?.[index]?.boxWidth}
                        touched={formik.touched.packages?.[index]?.boxWidth}
                      />
                      <RxCross2 className="hidden sm:block text-3xl mt-2 ms-2" />
                    </div>
                    <div className="flex justify-center">
                      <UnitField
                        placeholder="Breadth"
                        unit="CM"
                        name={`packages[${index}].boxBreadth`}
                        value={formik.values.packages[index]?.boxBreadth}
                        onChange={(e) => handleDimensionChange(e, index, 'boxBreadth')}
                        onBlur={formik.handleBlur}
                        error={formik.errors.packages?.[index]?.boxBreadth}
                        touched={formik.touched.packages?.[index]?.boxBreadth}
                      />
                      <RxCross2 className="hidden sm:block text-3xl mt-2 ms-2" />
                    </div>
                    <UnitField
                      placeholder="Height"
                      unit="CM"
                      name={`packages[${index}].boxLength`}
                      value={formik.values.packages[index]?.boxLength}
                      onChange={(e) => handleDimensionChange(e, index, 'boxLength')}
                      onBlur={formik.handleBlur}
                      error={formik.errors.packages?.[index]?.boxLength}
                      touched={formik.touched.packages?.[index]?.boxLength}
                    />
                    {!isAllSame && <div className="flex items-center" style={{ height: "50px", marginTop: "-18px" }}>
                      {formik.values?.packages[index]?.lock ? <MdLockOutline color="red" size={20} onClick={() => formik.setFieldValue(`packages[${index}].lock`, false)} /> : <MdLockOpen color="red" size={20} onClick={() => formik.setFieldValue(`packages[${index}].lock`, true)} />}
                    </div>}
                  </div>

                  <h5 className="bold-sansation mt-3">Upload Images</h5>
                  <div
                    className="w-full h-[5rem] flex items-center justify-center mt-2 p-2 border-dashed border-2 border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input
                      type="file"
                      multiple
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, index)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[index].click()}
                      className="flex items-center space-x-2 p-2 text-custom-green bold-sansation"
                    >
                      <div className="w-[1rem]">
                        <img src={uploads} alt="uploads" />
                      </div>
                      <span>Upload Images</span>
                    </button>
                  </div>

                  {imagePreviews[index] && imagePreviews[index].length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {imagePreviews[index].map((preview, i) => (
                        <div key={i} className="relative h-32">
                          <img
                            src={preview}
                            alt={`uploaded-${i}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, i)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex gap-4 pt-3">
                    <div className="w-1/2">
                      <CustomInputField
                        title="Volumetric Weight"
                        type="number"
                        placeholder="volumetric weight"
                        name={`packages[${index}].volumetricWeight`}
                        value={formik.values.packages[index]?.volumetricWeight}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.packages?.[index]?.volumetricWeight}
                        touched={formik.touched.packages?.[index]?.volumetricWeight}
                        readOnly
                        isMandatory={true}
                      />
                    </div>
                    <div className="w-1/2">
                      <CustomInputField
                        title="Approximate Weight"
                        type="number"
                        placeholder="Enter approximate weight"
                        name={`packages[${index}].approxWeight`}
                        value={formik.values.packages[index]?.approxWeight}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.packages?.[index]?.approxWeight}
                        touched={formik.touched.packages?.[index]?.approxWeight}
                        isMandatory={true}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <CustomInputField
                      title="Box Description"
                      type="text"
                      placeholder="Describe the item"
                      name={`packages[${index}].boxDescription`}
                      value={formik.values.packages[index]?.boxDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.packages?.[index]?.boxDescription}
                      touched={formik.touched.packages?.[index]?.boxDescription}
                    />
                  </div>
                  <div className="items-center flex mt-3">
                    <div>
                      <div className="flex gap-2 justify-center items-center relative">
                        <h5 className="bold-sansation pt-1">Sending Item without Invoice?</h5>
                        <ToggleButton
                          checked={formik.values.packages[index]?.withInvoice}
                          onChange={() => handleToggle(index)}
                          className="my-checkbox"
                          inputClassName="my-input"
                          toggleClassName="my-toggle"
                        />
                      </div>
                    </div>
                  </div>
                  {formik.values.packages[index]?.withInvoice && (
                    <div className="flex mt-1 gap-4">
                      <div className="w-full sm:w-1/2 mt-2 cursor-pointer items-end">
                        <div
                          className="w-full flex h-[45px] items-center border rounded-lg border-gray-300 focus-within:border-blue-500 cursor-pointer"
                          onClick={() => document.getElementById(`declarationFile-${index}`).click()} // Trigger the file input
                        >
                          <div className="bg-black w-1/4 text-custom-white text-2xl border rounded-l-lg border-black h-full flex items-center justify-center">
                            <MdUpload />
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              id={`declarationFile-${index}`} // Unique ID for each input
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, index, 'declarationFile')}
                            />
                            <p className="text-gray-400 font-sansation font-regular px-2 text-sm">
                              {formik.values.packages[index]?.declarationFileName || 'Upload file'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 m-2">
                            {formik.values.packages[index]?.declarationFile && (
                              <img
                                src={formik.values.packages[index].declarationFile}
                                alt="E-Way Bill"
                                className="w-10 h-10 object-contain"
                              />
                            )}
                          </div>
                        </div>
                        {formik.errors.packages?.[index]?.declarationFile && formik.touched.packages?.[index]?.declarationFile && (
                          <div className="text-red-500 text-sm mt-1">{formik.errors.packages[index].declarationFile}</div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 pt-3">
                  <div className="w-1/2">
                    <CustomInputField
                      title="Invoice Value (₹)"
                      type="number"
                      placeholder="Enter Package Value"
                      name={`packages[${index}].packageValue`}
                      value={formik.values.packages[index]?.packageValue}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.packages?.[index]?.packageValue}
                      touched={formik.touched.packages?.[index]?.packageValue}
                      isMandatory={true}
                    />
                  </div>

                  <div className="w-1/2">
                    <CustomInputField
                      title="Invoice Number"
                      type="number"
                      placeholder="Enter invoice number"
                      name={`packages[${index}].packageNumber`}
                      value={formik.values.packages[index]?.packageNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.packages?.[index]?.packageNumber}
                      touched={formik.touched.packages?.[index]?.packageNumber}
                    />
                  </div>
                  </div>

                  <div className="flex flex-col sm:flex-row mt-1 gap-1 sm:gap-4">
                    <div className="w-full sm:w-3/5">
                      <CustomInputField
                        title="E-Way Bill No"
                        type="text"
                        placeholder="Enter E-Way Bill No"
                        name={`packages[${index}].ewaybillNo`}
                        value={formik.values.packages[index]?.ewaybillNo}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.packages?.[index]?.ewaybillNo}
                        touched={formik.touched.packages?.[index]?.ewaybillNo}
                      />
                    </div>
                    <div className="w-full sm:w-1/2 cursor-pointer items-end pt-2 sm:pt-11" >
                      <div
                        className="w-full flex h-[45px] items-center border rounded-lg border-gray-300 focus-within:border-blue-500 cursor-pointer"
                        onClick={() => document.getElementById(`ewaybillFile-${index}`).click()} // Trigger the file input
                      >
                        <div className="bg-black w-1/4 text-custom-white text-2xl border rounded-l-lg border-black h-full flex items-center justify-center">
                          <MdUpload />
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            id={`ewaybillFile-${index}`} // Unique ID for each input
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, index, 'ewaybillFile')}
                          />
                          <p className="text-gray-400 font-sansation font-regular px-2 text-sm">
                            {formik.values.packages[index]?.ewaybillFileName || 'Upload E-Way Bill'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 m-2">
                          {formik.values.packages[index]?.ewaybillFile && (
                            <img
                              src={formik.values.packages[index].ewaybillFile}
                              alt="E-Way Bill"
                              className="w-10 h-10 object-contain"
                            />
                          )}
                        </div>
                      </div>
                      {formik.errors.packages?.[index]?.ewaybillFile && formik.touched.packages?.[index]?.ewaybillFile && (
                        <div className="text-red-500 text-sm mt-1">{formik.errors.packages[index].ewaybillFile}</div>
                      )}
                    </div>
                  </div>
                </div>

                {(packages.length > 1 && index !== 0) && (
                  <>
                    <div className="flex justify-end">
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => removePackage(index)}
                        className="text-red-500 font-bold"
                      >
                        <MdDelete className="text-red-500" size={25} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {!isAllSame && <div className="flex items-center justify-end mt-4 text-sm gap-1 text-custom-green bold-sansation cursor-pointer" onClick={() => addNewPackage(formik.values.packages?.length - 1)}>
              <FaPlus />
              <p>Add More</p>
            </div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupSection2;
