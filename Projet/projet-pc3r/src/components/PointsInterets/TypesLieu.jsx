import React from "react";

const TypesLieu = ({filtreTypeLieu, setCurrentPage}) => {
  return (
    <>
      <h3 className="text-l font-bold pt-5 pb-2">Types de lieu</h3>
      <select className="block w-full px-4 py-2 border bg-white border-blue-400 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-600"
      onChange={ (e) => {
        filtreTypeLieu(e.target.value);
        setCurrentPage(1);
      }}>
        <option value="Tous">Tous</option>
        <option value="fontaine">Fontaines à boire</option>
        <option value="atelier">Atelier de réparation</option>
      </select>
    </>
  );
};

export default TypesLieu;
