import React from "react";
import DatePicker from "react-datepicker";

const PassagesPeriode = ({ getStartDate, getEndDate, startDate, endDate }) => {
  const handleStartDate = (date) => {
    getStartDate(date);
  };
  const handleEndDate = (date) => {
    getEndDate(date);
  };

  return (
    <div id="PassagesPeriode">
      <div>
        <h2 className="text-l font-bold">Start Date :</h2>
        <div className="flex justify-center">
          <div className="flex items-center border border-gray-300 rounded-md p-2 mb-2 w-3/4 focus:border-neutral-700">
            <DatePicker
              startDate={new Date("2019-01-01T00:00:00")}
              selected={startDate}
              onChange={handleStartDate}
              dateFormat="yyyy-MM-dd"
              className="w-full focus:outline-none"
            />
            <div className="ml-auto pr-1">
              <i className="fas fa-calendar"></i>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-l font-bold">End Date :</h2>
        <div className="flex justify-center">
          <div className='flex items-center border border-gray-300 rounded-md p-2 mb-2 w-3/4 focus:border-neutral-700"'>
            <DatePicker
              startDate={new Date("2019-12-30T23:00:00")}
              selected={endDate}
              onChange={handleEndDate}
              dateFormat="yyyy-MM-dd"
              className="w-full focus:outline-none"
            />
            <div className="ml-auto pr-1">
              <i className="fas fa-calendar"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassagesPeriode;
