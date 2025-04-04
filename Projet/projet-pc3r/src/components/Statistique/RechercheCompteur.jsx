import React from 'react'

const RechercheCompteur = ({setFiltreNomCompteurs}) => {
  const filtrerCompteurs = (e) => {
    const input = document.getElementById('input-filtre-compteur').value
    setFiltreNomCompteurs(input);
  }
  return (
    <>
        <h3 className="text-l font-bold pt-5 pb-2">Recherche de compteur</h3>
        <div className="flex items-center w-full max-w-lg mx-auto">
        <div className="relative w-9/12 mr-2">
          <input
            id="input-filtre-compteur"
            onChange={filtrerCompteurs}
            type="text"
            className="w-full p-2 pl-10 pr-8 border rounded focus:outline-none focus:border-neutral-700"
            placeholder="Description..."
          />
          <i className="fas fa-search absolute top-1/2 transform -translate-y-1/2 right-2"></i>
        </div>
        </div>
    </>
  )
}

export default RechercheCompteur