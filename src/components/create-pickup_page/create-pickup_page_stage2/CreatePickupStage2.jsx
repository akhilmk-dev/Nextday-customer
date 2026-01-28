import React, { useState, useContext, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import editIcon from "../../../images/editIcon.png";
import SearchInput from "../../input-field/SearchInput";
import { GoPlus } from "react-icons/go";
import { myContext } from "../../../utils/context_api/context";
import CreateConsigner from "./CreateConsigner";
import CreateConsignee from "./CreateConsignee";
import request from '../../../utils/request';
import { FaLocationDot } from "react-icons/fa6";
import EditModal from "./EditModal";
import { fetchAddressList } from "../../../utils/helpers";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

const CreatePickupStage2 = ({ selectedConsigner, setSelectedConsigner, selectedConsignee, setSelectedConsignee, setSelectedConsigneeData, setSelectedConsignerData, formik, isToPay }) => {
  const {
    consignerModalOpen,
    setConsignerModalOpen,
    consigneeModalOpen,
    setConsigneeModalOpen,
    addressList,
    setAddressList,
  } = useContext(myContext);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addressData, setAddressData] = useState({});
  const [consigneeAddressList, setConsigneeAddressList] = useState([]);
  const [searchConsignee, setSearchConsignee] = useState('');
  const [searchConsignerAddress, setSearchConsignerAddress] = useState('');


  const fetchConsigneeAddressList = () => {
    request({
      url: "V1/customer/listConsigneeAddresses",
      method: "GET"
    }).then((response) => {
      setConsigneeAddressList(response.data);
    }).catch((err) => {
      if (err.response.status === 500) {
        toast.dismiss();
        toast.error(err.response.data.message);
      }
    });
  };

  const checkAddressExists = async (pincode) => {
    try {
      const response = await request({
        url: `V1/checkpincodeavailability?pincode=${pincode}&isTopay=${isToPay}&isDox=${formik?.values?.boxType == "box" ? true : false}&isNonDox=${formik?.values?.boxType == "nonBox" ? true : false}`,
        method: "GET",
      })
      const isAddressValid = response?.data?.[0]?.status === 1 ? true : false;
      return isAddressValid;
    } catch (error) {
      toast.dismiss();
      toast.error("something went wrong")
      return false;
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchConsignee) {
        request({
          url: `V1/customer/searchConsigneeAddress?searchTerm=${searchConsignee}`,
          method: 'GET',
        })
          .then((response) => {
            setConsigneeAddressList(response.data);
          })
          .catch((err) => {
            if (err.response?.status === 500) {
              toast.dismiss();
              toast.error(err.response.data.message);
            }
          });
      } else {
        fetchConsigneeAddressList()
      }
    }, 800); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchConsignee]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchConsignerAddress) {
        request({
          url: `V1/customer/searchConsignorAddress?searchTerm=${searchConsignerAddress}`,
          method: 'GET',
        })
          .then((response) => {
            setAddressList(response.data);
          })
          .catch((err) => {
            if (err.response?.status === 500) {
              toast.dismiss();
              toast.error(err.response.data.message);
            }
          });
      } else {
        fetchAddressList(setAddressList);
      }
    }, 800); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchConsignerAddress]);



  useEffect(() => {
    const savedConsigner = sessionStorage.getItem("selectedConsigner");
    const savedConsignee = sessionStorage.getItem("selectedConsignee");

    if (savedConsigner) {
      const parsedConsigner = JSON.parse(savedConsigner);
      setSelectedConsigner(parsedConsigner.addressId);
      setSelectedConsignerData(parsedConsigner);
    }

    if (savedConsignee) {
      const parsedConsignee = JSON.parse(savedConsignee);
      setSelectedConsignee(parsedConsignee.addressId);
      setSelectedConsigneeData(parsedConsignee);
    }

    fetchConsigneeAddressList();
    fetchAddressList(setAddressList);
  }, []);

  const handleDelete = (id) => {
    request({
      url: `V1/customer/address/${id}`,
      method: "DELETE"
    }).then((response) => {
      toast.dismiss();
      toast.success(response.message);
      fetchAddressList(setAddressList);
    }).catch(err => {
      if (err.response?.status === 500) {
        toast.dismiss();
        toast.error(err.response.data.message);
      }
    });
  };

  const handleConsignerSelect = async (item) => {
    const check = await checkAddressExists(item?.postalCode);
    if (check) {
      // setSelectedConsigner(selectedConsigner === item.addressId ? null : item.addressId); // Toggle selection
      // setSelectedConsignerData(selectedConsigner === item.addressId ? null : item);
      const isSame = selectedConsigner === item.addressId;
      const newId = isSame ? null : item.addressId;
      const newData = isSame ? null : item;

      setSelectedConsigner(newId);
      setSelectedConsignerData(newData);

      sessionStorage.setItem("selectedConsigner", JSON.stringify(newData));
    } else {
      toast.dismiss()
      toast.error("Pincode is not serviceable at this moment")
    }
  };

  const handleConsigneeSelect = async (item) => {
    const check = await checkAddressExists(item?.postalCode);
    if (check) {
      // setSelectedConsignee(selectedConsignee === item.addressId ? null : item.addressId); // Toggle selection
      // setSelectedConsigneeData(selectedConsignee === item.addressId ? null : item)
      const isSame = selectedConsignee === item.addressId;
      const newId = isSame ? null : item.addressId;
      const newData = isSame ? null : item;

      setSelectedConsignee(newId);
      setSelectedConsigneeData(newData);

      sessionStorage.setItem("selectedConsignee", JSON.stringify(newData));
    } else {
      toast.dismiss()
      toast.error("Pincode is not serviceable at this moment")
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h5 className="text-xl font-sansation font-regular">Choose a Consigner<span className="text-red-500"> *</span></h5>
        {consignerModalOpen && <CreateConsigner fetchAddressList={fetchAddressList} />}
        {consigneeModalOpen && <CreateConsignee fetchAddressList={fetchAddressList} />}
        {/* <SearchInput
          placeholder="Search to Select Consigner Address"
          onChange={(e) => setSearchConsignerAddress(e.target.value)}
          Icon={FiSearch}
          className="mt-3"
        /> */}

        <div className="relative mb-2 mt-3 sm:w-1/2">
          <SearchInput
            placeholder="Search to Select Consigner Address"
            onChange={(e) => setSearchConsignerAddress(e.target.value)}
            Icon={FiSearch}
            value={searchConsignerAddress}
            className="mt-3 sm:w-full"
          />
          {searchConsignerAddress && (
            <IoMdClose
              className='absolute top-1/2 right-8 transform -translate-y-1/2 text-lg cursor-pointer'
              onClick={() => setSearchConsignerAddress('')}
              title="Clear"
            />
          )}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 py-5 gap-4">
          {addressList?.map((item) => (
            <div
              key={item?.addressId}
              className={`relative border rounded-md p-[0.535rem] cursor-pointer ${selectedConsigner === item.addressId ? 'bg-gray-200' : ''}`}
              onClick={() => handleConsignerSelect(item)}
            >
              <img
                src={editIcon}
                alt="edit icon"
                className="absolute right-2 top-1"
                style={{ width: "20px", height: "20px" }}
                onClick={() => { setEditModalOpen(true); setAddressData(item); }}
              />
              <MdDelete
                className="absolute right-2 bottom-1 text-2xl text-red-500"
                onClick={(e) => { e.stopPropagation(); handleDelete(item?.addressId); }}
              />
              <div className="flex">
                <div className="text-custom-light-green flex h-10 items-center mt-1">
                  <div className="border rounded-md p-2 text-2xl">
                    <FaLocationDot />
                  </div>
                </div>
                <div className="ms-3 flex-1" style={{ minWidth: "170px" }}>
                  <h5 className="bold-sansation text-lg">{item?.fullName}</h5>
                  <p className="font-sansation font-regular text-sm whitespace-nowrap overflow-hidden text-ellipsis pr-5" style={{ minWidth: "100px" }}>
                    {item?.addressLine1 + ',' + item?.addressLine2 + ',' + item?.cityName + ',' + item?.stateName + ',' + item?.countryName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {addressList.length <= 0 && <div className="text-center">No Address Found</div>}

        {addressList.length <= 0 && <div className="flex items-center gap-2">
          <div
            className="p-2 border rounded-md text-2xl text-custom-light-green cursor-pointer"
            onClick={() => setConsignerModalOpen(true)}
          >
            <GoPlus />
          </div>
          <div>
            <p className="bold-sansation text-custom-light-green">Add New Consigner</p>
          </div>
        </div>}

        <div className="py-6">
          <h5 className="text-xl font-sansation font-regular">Choose a Consignee<span className="text-red-500"> *</span></h5>
          <div className="relative mb-2 mt-3 sm:w-1/2">
            <SearchInput
              placeholder="Search to Select Consignee Address"
              onChange={(e) => setSearchConsignee(e.target.value)}
              Icon={FiSearch}
              value={searchConsignee}
              className="mt-3 sm:w-full"
            />
            {searchConsignee && (
              <IoMdClose
                className='absolute top-1/2 right-8 transform -translate-y-1/2 text-lg cursor-pointer'
                onClick={() => setSearchConsignee('')}
                title="Clear"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 py-5 gap-4">
            {consigneeAddressList?.map((item) => (
              <div
                key={item?.addressId}
                className={`border rounded-md p-[0.535rem] relative cursor-pointer ${selectedConsignee === item.addressId ? 'bg-gray-200' : ''}`}
                onClick={() => handleConsigneeSelect(item)}
              >
                <img
                  src={editIcon}
                  alt="edit icon"
                  className="absolute right-2 top-1 cursor-pointer"
                  style={{ width: "20px", height: "20px" }}
                  onClick={() => { setEditModalOpen(true); setAddressData(item); }}
                />
                <MdDelete
                  className="absolute right-2 bottom-1 text-2xl text-red-500 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleDelete(item?.addressId); }}
                />
                <div className="flex">
                  <div className="text-custom-light-green flex h-10 items-center mt-1">
                    <div className="border rounded-md p-2 text-2xl">
                      <FaLocationDot />
                    </div>
                  </div>
                  <div className="ms-3 flex-1" style={{ minWidth: "170px" }}>
                    <h5 className="bold-sansation text-lg">{item?.fullName}</h5>
                    <p className="font-sansation font-regular text-sm whitespace-nowrap overflow-hidden text-ellipsis pr-5" style={{ minWidth: "100px" }}>
                      {item?.addressLine1 + ',' + item?.addressLine2 + ',' + item?.cityName + ',' + item?.stateName + ',' + item?.countryName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {consigneeAddressList.length <= 0 && <div className="text-center">No Address Found</div>}

          <div className="flex items-center gap-2">
            <div
              className="p-2 border rounded-md text-2xl text-custom-light-green cursor-pointer"
              onClick={() => setConsigneeModalOpen(true)}
            >
              <GoPlus />
            </div>
            <div>
              <p className="bold-sansation text-custom-light-green">Add New Consignee</p>
            </div>
          </div>
        </div>
        {editModalOpen && <EditModal isOpen={editModalOpen} fetchAddressList={fetchAddressList} data={addressData} setEditModalOpen={setEditModalOpen} />}
      </div>
    </>
  );
};

export default CreatePickupStage2;
