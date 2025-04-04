import React from 'react'
import StatistiquesTexte from './StatistiquesTexte'
import CompteurDate from './CompteurDate'
import RechercheCompteur from './RechercheCompteur'

const StatistiquesInfos = ({nbCompteurs, setFiltreNomCompteurs, setImplantation, setPageNumber, implantation}) => {
  return (
    <>
        <StatistiquesTexte nbCompteurs={nbCompteurs}/>
        <CompteurDate setImplantation={setImplantation} setPageNumber={setPageNumber} implantation={implantation}/>
        <RechercheCompteur setFiltreNomCompteurs={setFiltreNomCompteurs}/>
    </>
  )
}

export default StatistiquesInfos