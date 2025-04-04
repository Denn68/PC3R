import React from 'react'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'

const choixLieuChange = (e) => {
    const typeLieu = e.target.value;
    if (typeLieu === "atelier") {
        document.getElementById("longitude").style.display = "none";
        document.getElementById("latitude").style.display = "none";
        document.getElementById("labelLongisture").style.display = "none";
        document.getElementById("labelLatitude").style.display = "none";
    } else {
        document.getElementById("longitude").style.display = "block";
        document.getElementById("latitude").style.display = "block";
        document.getElementById("labelLongisture").style.display = "block";
        document.getElementById("labelLatitude").style.display = "block";
    }
}
const annulerAjout = () => {
    window.location.href = "/points_interet"
}

const ajouterPointInteret = async () => {
    let canSubmit = true;
    const nom = document.getElementById("nom").value;
    const adresse = document.getElementById("adresse").value;
    const codePostal = document.getElementById("codePostal").value;
    const arrondissement = document.getElementById("arrondissement").value === "Choisir..." ? "" : document.getElementById("arrondissement").value;
    const dateImplementation = document.getElementById("dateImplementation").value;
    const typeLieux = document.getElementById("typeLieux").value === "Choisir..." ? "" : document.getElementById("typeLieux").value;
    const longitude = document.getElementById("longitude").value;
    const latitude = document.getElementById("latitude").value;
    if (!nom) {
        document.getElementById("nom").classList.add("border-red-500");
        canSubmit = false;
    }
    if (!adresse) {
        document.getElementById("adresse").classList.add("border-red-500");
        canSubmit = false;
    }
    if (!codePostal) {
        document.getElementById("codePostal").classList.add("border-red-500");
        canSubmit = false;
    }
    if (!arrondissement) {
        document.getElementById("arrondissement").classList.add("border-red-500");
        canSubmit = false;
    }
    if (!typeLieux) {
        document.getElementById("typeLieux").classList.add("border-red-500");
        canSubmit = false;
    }
    const remarques = document.getElementById("remarques").value;
    const pointInteret = {
        "ID": 0,
        "Arrondissement": arrondissement,
        "Nom_parc_lieu": nom,
        "Intersection": adresse,
        "Date_installation": dateImplementation,
        "Remarque": remarques,
        "Longitude": longitude,
        "Latitude": latitude,
        "codePostal": codePostal,
        "type": typeLieux.toLowerCase(),
    }
    if (canSubmit) {
        const response = await fetch('http://localhost:8000/gti525/v1/pointsdinteret/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pointInteret),
        })
        
        if (response.status === 200) {
            window.location.href = "/points_interet"

        }
    }
}

const populatePointInteret = (selectedID) => {
    fetch(`http://localhost:8000/gti525/v1/pointsdinteret/${selectedID}`)
        .then((response) => response.json())
        .then((data) => {
            if (data[0]) {
                document.getElementById("nom").value = data[0].Nom_parc_lieu ? data[0].Nom_parc_lieu  : "";
                document.getElementById("adresse").value = data[0].Intersection ? data[0].Intersection : "";
                document.getElementById("remarques").value = data[0].Remarque ? data[0].Remarque : "";
                document.getElementById("longitude").value = data[0].Longitude ? data[0].Longitude : "";
                document.getElementById("latitude").value = data[0].Latitude ? data[0].Longitude : "";
                document.getElementById("typeLieux").value = data[0].type ? data[0].type : "Choisir...";
                document.getElementById("arrondissement").value = data[0].Arrondissement ? data[0].Arrondissement : "Choisir...";
                document.getElementById("dateImplementation").value = data[0].Date_installation ? data[0].Date_installation : "";
                document.getElementById("codePostal").value = data[0].codePostal ? data[0].codePostal : "";
            }
        });
}

const AjouterPointInteretForm = ( {selectedID, setModifierPointInteret }) => {
    const [arrondissements, setArrondissements] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    useEffect(() => {
        const fetchArrondissements = async () => {
            const response = await fetch('http://localhost:8000/gti525/v1/pointsdinteret/arrondissement');
            const data = await response.json();
            setArrondissements(data);
        };
        fetchArrondissements();
        populatePointInteret(selectedID);
    }, [selectedID]);
  return (
    <>
    <div className="text-xl font-semibold text-gray-700">Ajout d'un Point d'Intérêt</div>
    <div className="container mx-auto p-8">
        <div className="mx-auto bg-blue-100 rounded-lg">
            <div className="md:flex">
                <div className="w-full p-4">
                    <div className="relative">
                        <form className="mt-4 w-full">
                            {/* Ligne 1 : Nom */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-left text-sm font-bold mb-2" htmlFor="nom">Nom</label>
                                <input placeholder="Nom du point d'interet" type="text" id="nom" name="nom" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                            </div>

                            {/* Ligne 2 : Adresse et Code Postal */}
                            <div className="mb-4 flex">
                                <div className="w-3/4 mr-2">
                                    <label className="block text-gray-700 text-left text-sm font-bold mb-2" htmlFor="adresse">Adresse</label>
                                    <input placeholder="1234 rue des poisson, app 3" type="text" id="adresse" name="adresse" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-gray-700 text-left text-sm font-bold mb-2" htmlFor="codePostal">Code Postal</label>
                                    <input placeholder="H1H 1H1" type="text" id="codePostal" name="codePostal" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                                </div>
                            </div>

                            {/* Ligne 3 : Arrondissement et Date d'implémentation */}
                            <div className="mb-4 flex">
                                <div className="w-3/4 mr-2">
                                    <label className="block text-gray-700 text-left text-sm font-bold mb-2" htmlFor="arrondissement">Arrondissement</label>
                                    {/* Remplacez les options par vos arrondissements */}
                                    <select id="arrondissement" name="arrondissement" className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                        <option value="">Choisir...</option>
                                        {arrondissements.map((arrondissement) => (
                                            <option key={arrondissement.code} value={arrondissement.nom}>{arrondissement.nom}</option>
                                        )
                                        )}
                                    </select>
                                </div>
                                <div className="flex-1 mt-4 md:mt-0">
                                    <label htmlFor="dateImplementation" className="block text-gray-700 text-sm font-bold mb-2">
                                        Date d'implémentation (Année)
                                    </label>
                                    <DatePicker
                                        id="dateImplementation"
                                        selected={startDate}
                                        onChange={(date) => {
                                            setStartDate(date);
                                        }}
                                        dateFormat="yyyy"
                                        showYearPicker
                                        yearDropdown
                                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            </div>

                            {/* Ligne 4 : Type de Lieux, Longitude et Latitude */}
                            <div className="mb-4 flex">
                                <div className="w-1/3 mr-2">
                                    <label className="block text-gray-700 text-left text-sm font-bold mb-2" htmlFor="typeLieux">Type de Lieu</label>
                                    <select id="typeLieux" name="typeLieux" className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        onChange={choixLieuChange}
                                        >
                                        <option value="">Choisir...</option>
                                        <option value="atelier">Atelier</option>
                                        <option value="fontaine">Fontaine</option>
                                    </select>
                                </div>
                                <div className="w-1/3 mr-2">
                                    <label className="block text-gray-700 text-left text-sm font-bold mb-2" id="labelLongisture" htmlFor="longitude">Longitude</label>
                                    <input placeholder="12.1234567" type="text" id="longitude" name="longitude" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-gray-700 text-left text-sm font-bold mb-2" id="labelLatitude" htmlFor="latitude">Latitude</label>
                                    <input placeholder="12.1234567" type="text" id="latitude" name="latitude" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </div>
                            </div>

                            {/* Ligne 5 : Titre du champ Remarques */}
                            <div className="mb-2">
                                <label className="block text-gray-700 text-left text-sm font-bold mb-2" htmlFor="remarques">Remarques</label>
                            </div>

                            {/* Ligne 6 : Champ Remarques */}
                            <div className="mb-4">
                                <textarea placeholder="Remarques ici..." id="remarques" name="remarques" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"></textarea>
                            </div>

                            {/* Bouton Ajouter */}
                            <div className="flex justify-end">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                                type="button"
                                onClick={ (e) => {
                                    ajouterPointInteret(e);
                                    setModifierPointInteret(false);
                                }}
                                >
                                    Enregistrer
                                </button>
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 ml-2 rounded focus:outline-none focus:shadow-outline" 
                                type="button"
                                onClick={ (e) => {
                                    annulerAjout(e);
                                    setModifierPointInteret(false);
                                }}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default AjouterPointInteretForm;