import React from 'react';
import { Bar } from 'react-chartjs-2';
// eslint-disable-next-line
import { Chart as ChartJS } from 'chart.js/auto'; 
// fondamentalement, ChartJS est une classe, 
// donc on doit l'instancier avec new ChartJS() pour afficher les graphiques

const PassagesGraphs = ({ chartData }) => {
  //inspired from https://www.youtube.com/watch?v=RF57yDglDfE&t=1003s
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
                Passages Vélos
              </h6>
              <div>
                <Bar data={chartData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PassagesGraphs;
