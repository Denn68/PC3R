import React, {useState, useEffect} from "react";
import ItenerairesInfos from "./ItinerairesInfos";
import ItenerairesCarte from "./ItinerairesCarte";
//import itineraires from '../../Data/reseau_cyclable.geojson'

let nbKm = 0;

export const Itineraires = () => {

  const [itinerairesData, setItinerairesData] = useState();
  const [itinerairesDataFiltred, setItinerairesDataFiltred] = useState();
  const [itinerairesDataMAJ, setItinerairesDataMAJ] = useState({
    saison4: "1",
    typeVoies: "",
  });
  const [populairesDate, setPopulairesDate] = useState({
    searchRequest: 0,
    startDate: new Date(2019, 0, 1),
    endDate: new Date(2022, 11, 31),
  });

  useEffect(() => {
    const fetchData = async () => {
			const response = await fetch('http://localhost:8000/gti525/v1/pistes/');
			const data = await response.json();

      nbKm = 0;

      // Calcul du nombre de km
      data.features.forEach(
        (feature) => {
          nbKm += feature.properties.LONGUEUR;
        }
      );

			setItinerairesData(data);
		};

		if (populairesDate.searchRequest === 0) fetchData();
  } , [populairesDate]); // On met itinerairesDataMAJ en dépendance pour que le useEffect se lance à chaque fois que l'utilisateur change les filtres

  useEffect(() => {
    const filterData = async () => {
      const data = JSON.parse(JSON.stringify(itinerairesData)); // On crée une copie

      // Couleurs attribuées selon le type de voie selon les propriétés REV_AVANCEMENT_CODE, AVANCEMENT_CODE et TYPE_VOIE_CODE
      data.features.forEach((feature) => {
        if(feature.properties.REV_AVANCEMENT_CODE === "EV" || feature.properties.REV_AVANCEMENT_CODE === "PE" || feature.properties.REV_AVANCEMENT_CODE === "TR"){
          feature.properties.COULEUR = "#2AC7DD";
        }
        
        else if(feature.properties.AVANCEMENT_CODE === "E" && (feature.properties.TYPE_VOIE_CODE === "4" || feature.properties.TYPE_VOIE_CODE === "5" || feature.properties.TYPE_VOIE_CODE === "6")){
          feature.properties.COULEUR = "#025D29";
        }
        
        if(feature.properties.AVANCEMENT_CODE === "E"){

          if (feature.properties.TYPE_VOIE_CODE === "1" || feature.properties.TYPE_VOIE_CODE === "3" || feature.properties.TYPE_VOIE_CODE === "8" || feature.properties.TYPE_VOIE_CODE === "9"){
            feature.properties.COULEUR = "#84CA4B";
          }
          
          else if(feature.properties.TYPE_VOIE_CODE === "7"){
            feature.properties.COULEUR = "#B958D9";
          }
        }
      });

      // Filtre par saison
      if(itinerairesDataMAJ.saison4 === "2") data.features = data.features.filter((feature) => feature.properties.SAISONS4 === "Oui");

      // Filtre par type de voie
      if(itinerairesDataMAJ.typeVoies === "protégées") data.features = data.features.filter(
        (feature) => 
          feature.properties.TYPE_VOIE_CODE === "4" ||
          feature.properties.TYPE_VOIE_CODE === "5" ||
          feature.properties.TYPE_VOIE_CODE === "6" ||
          feature.properties.TYPE_VOIE_CODE === "7"
        );
      
      else if(itinerairesDataMAJ.typeVoies === "partagées") data.features = data.features.filter(
        (feature) =>
          feature.properties.TYPE_VOIE_CODE === "1" ||
          feature.properties.TYPE_VOIE_CODE === "3" ||
          feature.properties.TYPE_VOIE_CODE === "8" ||
          feature.properties.TYPE_VOIE_CODE === "9"
        );

			setItinerairesDataFiltred(data);
    };

    if(itinerairesData) filterData();
  } , [itinerairesDataMAJ,itinerairesData]); // On met itinerairesDataMAJ en dépendance pour que le useEffect se lance à chaque fois que l'utilisateur change les filtres

  useEffect(() => {
    const filterDataPopularity = async () => {
      console.log("Date search request");
      const response = await fetch(`http://localhost:8000/gti525/v1/pistes?populaireDebut=${populairesDate.startDate}&populaireFin=${populairesDate.endDate}`);
			const data = await response.json();

      setItinerairesData(data);
    };

    if(populairesDate.searchRequest === 1) filterDataPopularity();
  } , [populairesDate]); // On met populairesDate en dépendance pour que le useEffect se lance à chaque fois que l'utilisateur change les filtres
    
      

  return (
    <div className="flex w-full p-5">
      <div className="w-1/4 p-5">
        <ItenerairesInfos nbKm={nbKm} itinerairesDataMAJ={itinerairesDataMAJ} setItinerairesDataMAJ={setItinerairesDataMAJ} setPopulairesDate={setPopulairesDate} />
      </div>
      <div className="w-3/4 p-5"> 
        {/* TODO:  put this in a component */}
        <ItenerairesCarte itinerairesDataFiltred={itinerairesDataFiltred} itinerairesDataMAJ={itinerairesDataMAJ}/>
      </div>
    </div>
  );
};

export default Itineraires;
