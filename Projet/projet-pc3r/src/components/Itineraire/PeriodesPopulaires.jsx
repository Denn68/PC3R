import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// datepicker inspired from : https://github.com/Hacker0x01/react-datepicker/blob/main/docs/datepicker.md

export const PeriodesPopulaires = ({setPopulairesDate}) => {
    const [startDate, setStartDate] = useState(new Date(2019, 0, 1));
    const [endDate, setEndDate] = useState(new Date(2022, 11, 31));

    const handlePopulaires = (e) => {
        if(e.target.id === "search") {
        // Convertir les dates en format AAAAMMJJ
          const startDateConvertie = startDate.getFullYear() + ("0" + (startDate.getMonth() + 1)).slice(-2) + ("0" + startDate.getDate()).slice(-2);
          const endDateConvertie = endDate.getFullYear() + ("0" + (endDate.getMonth() + 1)).slice(-2) + ("0" + endDate.getDate()).slice(-2);
          setPopulairesDate({searchRequest: 1, startDate: startDateConvertie, endDate: endDateConvertie});
        }
        else if(e.target.id === "cancel-search") {
          setPopulairesDate({searchRequest: 0, startDate: "", endDate: ""});
        }
    }
  
    return (
      <>
        <h3 className="text-l font-bold">Les plus populaires par période</h3>
        <div className="py-5">
          <div className="flex items-center border border-gray-300 rounded-md p-2 mb-2 w-10/12">
            <div className="w-full">
              <span className="text-xs text-gray-500 mr-1">De:</span>
              <DatePicker
                startDate={new Date()}
                dateFormat="MM/dd/yyyy"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="w-full focus:outline-none"
              />
            </div>
            <div className="ml-auto pr-1">
              <i className="fas fa-calendar"></i>
            </div>
          </div>
  
          <div className="flex items-center border border-gray-300 rounded-md p-2 w-10/12">
            <div className="w-full"> 
              <span className="text-xs text-gray-500 mr-1">À:</span>
              <DatePicker
                startDate={new Date()}
                dateFormat="MM/dd/yyyy"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="w-full focus:outline-none"
              />
            </div>
            <div className="ml-auto pr-1">
              <i className="fas fa-calendar"></i>
            </div>
          </div>
          
          <div className="inline-flex" role="group">
            <div className="flex items-center mt-2">
              <button
                id="search"
                type="button"
                className={`-ml-0.5 inline-block border-2 rounded-md border-blue-500 px-6 pb-[6px] pt-2 text-xs uppercase leading-normal text-blue-600 ease-in-out hover:underline hover:text-white hover:bg-blue-600`}
                data-te-ripple-init
                data-te-ripple-color="light"
                onClick={handlePopulaires}
              >
                Rechercher
              </button>
            </div>
            <div className="flex items-center mt-2 ml-2">
              <button
                id="cancel-search"
                type="button"
                className={`-ml-0.5 inline-block border-2 rounded-md border-blue-200 px-6 pb-[6px] pt-2 text-xs uppercase leading-normal text-blue-300 ease-in-out hover:underline hover:text-white hover:bg-blue-300`}
                data-te-ripple-init
                data-te-ripple-color="light"
                onClick={handlePopulaires}
              >
                Annuler
              </button>
            </div>
          </div>

        </div>
      </>
    );
  };  

export default PeriodesPopulaires