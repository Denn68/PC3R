import React from 'react'
import ItinerairesTexte from './ItinerairesTexte';
import Reseaux from './Reseaux';
import TypesVoies from './TypesVoies';
import PeriodesPopulaires from './PeriodesPopulaires';

export const ItenerairesInfos = ({nbKm, itinerairesDataMAJ, setItinerairesDataMAJ, setPopulairesDate}) => {
  return (
    <>
      <ItinerairesTexte nbKm={nbKm}/>
      <Reseaux itinerairesDataMAJ={itinerairesDataMAJ} setItinerairesDataMAJ={setItinerairesDataMAJ} />
      <TypesVoies itinerairesDataMAJ={itinerairesDataMAJ} setItinerairesDataMAJ={setItinerairesDataMAJ} />
      <PeriodesPopulaires setPopulairesDate={setPopulairesDate} />
    </>
  )
}

export default ItenerairesInfos;