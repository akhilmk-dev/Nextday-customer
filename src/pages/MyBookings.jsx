import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import SearchInput from "../components/input-field/SearchInput";
import { CiSearch } from "react-icons/ci";
import toast from "react-hot-toast";
import TrackingCard from "../components/card/TrackingCard";
import { TablePagination } from "@mui/material";
import request from "../utils/request";
import FadeLoader from "react-spinners/FadeLoader";
import Breadcrub from "../components/button/Breadcrub";
import { IoMdClose } from "react-icons/io";

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // UI states
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("all");
  const [cardClicked, setCardClicked] = useState(false);

  // Pagination states (IMPORTANT)
  const [page, setPage] = useState(0); // MUI is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [totalCount, setTotalCount] = useState(0);

  // Data states
  const [bookingList, setBookingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearch, setIsSearch] = useState(false);

  // ===============================
  // FETCH BOOKINGS (PAGINATED)
  // ===============================
  const fetchBookingDetails = () => {
    setIsLoading(true);

    request({
      url: `/V1/customer/bookings?pageNumber=${page + 1}&pageSize=${rowsPerPage}&status=${filter}`,
      method: "GET",
    })
      .then((response) => {
        const data = response?.data || [];
        setBookingList(data);
        setTotalCount(data.length ? Number(data[0].total) : 0);
        setIsSearch(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      })
      .finally(() => setIsLoading(false));
  };

  // ===============================
  // EFFECTS
  // ===============================
  useEffect(() => {
    fetchBookingDetails();
  }, [page, rowsPerPage, filter]);

  useEffect(() => {
    if (location.pathname === "/home/my-bookings") {
      setCardClicked(false);
    }
  }, [location.pathname]);

  // ===============================
  // FILTER HANDLER
  // ===============================
  const handleClick = (index) => {
    setSelected(index);
    setFilter(
      index === 0
        ? "all"
        : index === 1
          ? "pickuprequest"
          : index === 2
            ? "intransit"
            : "completed"
    );
    setPage(0);
  };

  // ===============================
  // PAGINATION HANDLERS
  // ===============================
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ===============================
  // SEARCH HANDLERS
  // ===============================
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) {
      setIsSearch(false);
      fetchBookingDetails();
      return;
    }

    setIsLoading(true);
    setIsSearch(true);

    request({
      url: `/V1/customer/search/bookings?searchQuery=${searchQuery}`,
      method: "GET",
    })
      .then((response) => {
        const data = response?.data || [];
        setBookingList(data);
        setTotalCount(data.length); // search result count
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Search failed");
      })
      .finally(() => setIsLoading(false));
  };

  // ===============================
  // CARD CLICK
  // ===============================
  const handleCardClick = (data) => {
    const source = data?.Source?.toLowerCase();
    if (source === "pickuprequest") {
      navigate(`/create-pickup-request?id=${data?.pickupReqId}`);
    } else {
      setCardClicked(true);
      navigate(`/home/customer/details/${data?.bookingId}`);
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div>
      <Breadcrub pageTitle="My Bookings" />

      {!cardClicked ? (
        <>
          {/* FILTER + SEARCH */}
          <div className="grid grid-cols-1 md:grid-cols-2 mt-2  items-center  ">
            {<div className="grid grid-cols-4 border h-[48px] rounded-md bold-sansation text-sm    ">
              {["All", "Requested", "Ongoing", "Completed"].map(
                (label, index) => (
                  <div className=" flex justify-center items-center " key={index}>
                    <div
                      onClick={() => handleClick(index)}
                      className={`flex cursor-pointer justify-center  items-center rounded-md p-1 m-2  w-full 
            ${selected === index
                          ? "bg-custom-green text-white"
                          : `bg-${label.toLowerCase()}-300`
                        }`}
                    >
                      {label}
                    </div>
                  </div>
                )
              )}
            </div>}
            <div className="flex justify-center items-center h-auto mx-3 mb-1 ">
              <div className='relative mb-2 mt-3 md:w-3/4' >
                <SearchInput
                  placeholder="Search "
                  onChange={handleSearchChange} Icon={CiSearch} value={searchQuery}
                  className=" w-full py-1 mt-0 sm:w-full md:w-full"
                />
                {searchQuery && (
                  <IoMdClose
                    className='absolute top-1/2 right-8 transform -translate-y-1/2 text-lg cursor-pointer'
                    onClick={() => handleSearchChange({ target: { value: '' } })}
                    title="Clear"
                  />
                )}
              </div>
              <button onClick={handleSearchSubmit} type="submit" className="bg-custom-green flex items-center h-[45px] justify-center rounded-md text-white font-sansation font-regular mt-1  ms-2 px-3">Search</button>
            </div>
          </div>

          {/* LIST */}
          <div style={{ minHeight: "350px" }}>
            {!isLoading &&
              bookingList.map((item, index) => (
                <TrackingCard
                  key={index}
                  status={item?.bookingStatus}
                  data={item}
                  onClick={() => handleCardClick(item)}
                />
              ))}

            {isLoading && (
              <div className="flex justify-center items-center h-[350px]">
                <FadeLoader color="green" />
              </div>
            )}

            {!isLoading && bookingList.length === 0 && (
              <div className="flex justify-center items-center h-[350px]">
                No Booking Found
              </div>
            )}
          </div>

          {/* PAGINATION (HIDDEN DURING SEARCH) */}
          {!isSearch && (
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[2, 4, 6, 8, 10]}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default MyBookings;
