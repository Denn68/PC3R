import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import PassagesGraphs from "./PassagesGraphs";
import PassagesIntervalle from "./PassagesIntervalle";
import PassagesPeriode from "./PassagesPeriode";

export const Passagers = ({
  isOpen,
  onClose,
  selectedItemName,
  selectedItemId,
}) => {
  // Periodes variables
  const [startDate, setStartDate] = useState(new Date("2019-01-01T00:00:00"));
  const [endDate, setEndDate] = useState(new Date("2019-03-30T23:00:00"));

  //Getters for the dates
  const getStartDate = (startDate) => {
    setStartDate(startDate);
  };

  const getEndDate = (endDate) => {
    setEndDate(endDate);
  };

  // Intervalle variables
  const [selectedOption, setSelectedOption] = useState("jour");

  const getSelectedOption = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  //loading state
  const [isLoading, setIsLoading] = useState(true);

  //Data to display after filtering and cleaning chartData
  const [dataToDisplay, setDataToDisplay] = useState({});

  //Refetch data when dates are changed
  useLayoutEffect(() => {
    const fetchData = async (startDate, endDate) => {
      try {
        const formatedStartDate = startDate
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const formatedEndDate = endDate
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");

        setIsLoading(true);

        const response = await fetch(
          `http://localhost:8000/gti525/v1/compteurs/${selectedItemId}/passages?debut=${formatedStartDate}&fin=${formatedEndDate}&intervalle=${selectedOption}`
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const data = await response.json();

        setIsLoading(false);

        // exception handling so that the chart is shown even if data is null
        data
          ? setDataToDisplay(data)
          : setDataToDisplay({
              labels: ["En attente de date"],
              datasets: [
                {
                  label: "En attente de date",
                  data: [],
                },
              ],
            });
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData(startDate, endDate);
    // eslint-disable-next-line
  }, [startDate, endDate, selectedOption]);

  //********************************************************************************************/
  // ***Close the modal when clicking outside of it*** //
  // Create a ref for the modal content
  const modalContentRef = useRef();

  // Add a click event listener to the modal content
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(e.target)
      ) {
        onClose();
        setSelectedOption("jour");
        setDataToDisplay({
          labels: ["En attente de date"],
          datasets: [
            {
              label: "En attente de date ",
              data: [],
            },
          ],
        });
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleOutsideClick);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);
  //******************************************************************************************* */

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-70 flex justify-center items-center">
      <div
        className="relative p-6 w-4/5 h-4/5 rounded-lg bg-white"
        ref={modalContentRef}
      >
        <div className="flex justify-between items-center py-2">
          <div className="text-xl font-bold text-left">
            <p>Statistiques des passages : {selectedItemName}</p>
          </div>
          <button
            className="font-bold rounded-md p-1 bg-blue-400 hover:bg-blue-500 text-white"
            onClick={() => {
              onClose();
              setSelectedOption("jour");
              setDataToDisplay({
                labels: [],
                datasets: [{ label: "En attente de date", data: [] }],
              });
            }}
          >
            X
          </button>
        </div>
        <hr />
        <div className="flex">
          <div className="w-9/12">
            <div>
              {isLoading ? (
                <div className="flex justify-center m-16 p-32">
                  <h1>Loading...</h1>
                </div>
              ) : (
                <PassagesGraphs chartData={dataToDisplay} />
              )}
            </div>
          </div>
          <div className="w-3/12">
            <div className="row py-4">
              <PassagesPeriode
                getStartDate={getStartDate}
                getEndDate={getEndDate}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <hr />
            <div className="row p-4">
              <PassagesIntervalle
                getSelectedOption={getSelectedOption}
                selectedOption={selectedOption}
              />
            </div>
          </div>
        </div>
        <hr />
        <div className="flex justify-end w-full p-4">
          <button
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              onClose();
              setSelectedOption("jour");
              setDataToDisplay({
                labels: [],
                datasets: [{ label: "En attente de date", data: [] }],
              });
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Passagers;
