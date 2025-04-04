import React from 'react'

const ItinerairesTexte = ({nbKm}) => {
  return (
    <>
        <h3 className="text-xl font-bold">Pistes et voies cyclables</h3>
        <p className="text-base py-5">
            Le réseau cyclable de Montréal est composé de {nbKm} km de voies cyclables 
        </p>
    </>
  )
}

export default ItinerairesTexte;