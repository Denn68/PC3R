import React, { useEffect, useState } from 'react'

// inspiré de https://tailwind-elements.com/docs/standard/forms/select/

const Arrondissements = ( { selectedName ,filtreArrondissement } ) => {
  const [arrondissements, setArrondissements] = useState([]);
  const choixArrondissement = (e) => {
    filtreArrondissement(e.target.value);
  }
  useEffect(() => {
    const getArrondissements = async () => {
      const response = await fetch('http://localhost:8000/gti525/v1/pointsdinteret/arrondissement');
      const data = await response.json();
      // Remove dups with Set then go back to Array
      const arrondissementsSet = new Set(
        data.map((feature) => feature.nom)
      );
      let arrondissementsArray = [...arrondissementsSet].filter(value => value !== null);
      setArrondissements(arrondissementsArray);
    };
    getArrondissements();
  }, []);

  return (
    <>
        <h3 className="text-l font-bold pt-5 pb-2">Arrondissement</h3>
        <select
        value={selectedName}
        onChange={choixArrondissement}
        className="block w-full px-4 py-2 border bg-white border-blue-400 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-600"
        >
            <option>{selectedName}</option>
            {
              arrondissements.length > 0 ? (
                arrondissements.map((arrondissement) => (
                  <option key={arrondissement}>{arrondissement}</option>
                ))
              )
                : (
                  <option>Chargement...</option>
                )
            }
        </select>
    </>
  )
}

export default Arrondissements