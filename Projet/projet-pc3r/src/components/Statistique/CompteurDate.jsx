import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useLayoutEffect } from "react";

const CompteurDate = ({ setImplantation, setPageNumber, implantation }) => {
  const [startDate, setStartDate] = useState(new Date("2008"));

  const handleCancelFilter = () => {
    setStartDate(new Date("2008"));
    setImplantation(Number(0));
    // Bring back the first page before applying the filter to not cause rendering errors
    setPageNumber(1);
  };

  useLayoutEffect(() => {
    if (implantation === 0) {
      document.getElementById('dateFilter').classList.remove('bg-red-500');
      document.getElementById('dateFilter').classList.remove('text-white');
      document.getElementById('dateFilter').classList.add('text-black');
    } else {
      document.getElementById('dateFilter').classList.add('bg-red-500');
      document.getElementById('dateFilter').classList.add('text-white');
      document.getElementById('dateFilter').classList.remove('text-black');
    }
  }, [implantation]);

  return (
    <>
      <h3 className="text-l font-bold pb-5">
        Compteurs implémentés à partir de :
      </h3>
      <div className="flex align-middle">
        <div className="flex items-center border border-gray-300 rounded-md p-2 mb-2 w-3/4 focus:border-neutral-700">
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setImplantation(date.getFullYear());
              setStartDate(date);
              // Bring back the first page before applying the filter to not cause rendering errors
              setPageNumber(1);
            }}
            dateFormat="yyyy"
            showYearPicker
            yearDropdown
            className="w-full focus:outline-none"
          />
          <div className="ml-auto pr-1">
            <i className="fas fa-calendar"></i>
          </div>
        </div>

        <div
          id="dateFilter"
          className="flex items-center border border-gray-300 rounded-md p-2 mb-2 w-1/8 focus:border-neutral-700"
          title="Cancel filter"
        >
          <button>
            <i className="text-center font-bold" onClick={handleCancelFilter}>
              X
            </i>
          </button>
        </div>
      </div>
    </>
  );
};

export default CompteurDate;
