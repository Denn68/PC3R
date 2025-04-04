import React from 'react'

const StatistiquesTexte = ({nbCompteurs}) => {
  return (
    <>
        <h3 className="text-xl font-bold">Statistiques</h3>
        <p className="text-base py-5">
            Le réseau cyclable de Montréal est composé de {nbCompteurs} pistes et voies cyclables 
        </p>
    </>
  )
}

export default StatistiquesTexte