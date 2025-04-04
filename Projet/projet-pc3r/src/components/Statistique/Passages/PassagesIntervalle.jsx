import React from 'react';


const PassagesIntervalle = ({getSelectedOption , selectedOption}) => {
  
  const handleSelectedOption = (e) => {
    const selectedOption = e.target.value;
    getSelectedOption(selectedOption);
  };

  return (
<div id="PassagesIntervalle">
      <h2 className="font-bold">Largeur d'intervalle :</h2>
      <div className="text-left">
        <div className="p-1">
          <label>
            <input
              type="radio"
              value="jour"
              checked={selectedOption === "jour"}
              onChange={handleSelectedOption}
              className="mr-2"
            />
            Jour
          </label>
        </div>
        <div className="p-1">
          <label>
            <input
              type="radio"
              value="semaine"
              checked={selectedOption === "semaine"}
              onChange={handleSelectedOption}
              className="mr-2"
            />
            Semaine
          </label>
        </div>
        <div className="p-1">
          <label>
            <input
              type="radio"
              value="mois"
              checked={selectedOption === "mois"}
              onChange={handleSelectedOption}
              className="mr-2"
            />
            Mois
          </label>
        </div>
      </div>
    </div>
  );
};

export default PassagesIntervalle;