import React from 'react';
import MyMapContainer from './MyMapContainer';


const CartePointInteret = ({ filtreArrondissement, isCarteOpen, setIsCarteOpen, selectedID }) => {
  return (
    <div
      className={`fixed left-0 top-0 z-[1055] bg-gray-500 bg-opacity-40 ${isCarteOpen ? 'block' : 'hidden'} h-full w-full overflow-y-auto overflow-x-hidden outline-none`}
      tabIndex="-1"
      aria-labelledby="POICarte"
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`pointer-events-none relative w-auto ${isCarteOpen ? 'translate-y-0 opacity-100' : 'translate-y-[-50px] opacity-0'} transition-all duration-300 ease-in-out min-[576px]:mx-auto min-[576px]:mt-7 min-[576px]:max-w-[500px] min-[992px]:max-w-[800px] min-[1200px]:max-w-[1140px]`}
      >
        <div
          className="pointer-events-auto relative flex w-full flex-col rounded-md border-none bg-white bg-clip-padding text-current shadow-lg outline-none dark:bg-neutral-600"
        >
          <div
            className="flex flex-shrink-0 items-center justify-between rounded-t-md border-b-2 border-neutral-100 border-opacity-100 p-4 dark:border-opacity-50"
          >
            <h5
              className="text-2xl font-medium leading-normal text-neutral-800 dark:text-neutral-200"
            >
              Points d'interets : {filtreArrondissement}
            </h5>
            <button
              type="button"
              className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
              onClick={() => setIsCarteOpen(false)}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="relative p-4">
            <MyMapContainer selectedID={selectedID} filtreArrondissement={filtreArrondissement} isCarteOpen={isCarteOpen}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartePointInteret;
