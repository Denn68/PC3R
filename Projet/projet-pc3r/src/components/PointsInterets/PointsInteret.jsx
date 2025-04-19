import React from "react";
import PointsInteretInfos from "./PointsInteretInfos";
import TableauPointsInteret from "./TableauPointsInteret";
import { useState, useEffect } from "react";
import AjouterPointInteretForm from "./AjouterPointInteretForm";
import PageSelector from "../subComponents/PageSelector";
import CartePointInteret from "./CartePointInteret";

let nbrPointsInteret = 0;
export const PointsInteret = ({ ajouterPointInteret }) => {
  const [pointsInteret, setPointsInteret] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [filtreArrondissement, setFiltreArrondissement] = useState("Saint-Léonard");
  const [filtreTypeLieu, setFiltreTypeLieu] = useState("Tous");
  const [pageNumber, setPageNumber] = useState(1);
  const [nbPages, setNbPages] = useState([]);
  const [selectedID, setSelectedID] = useState(-1);
  const [modifierPointInteret, setModifierPointInteret] = useState(false);
  const [isCarteOpen, setIsCarteOpen] = useState(false);

  useEffect(() => {
    const fetchPointsInteret = async () => {
      let results;
      try {
        const response = await fetch("http://localhost:8000/gti525/v1/pointsdinteret/tous");
        const allData = await response.json();
        let filteredData;
        nbrPointsInteret = allData.length;
        if (filtreArrondissement === "Tous") {
          if (filtreTypeLieu === "Tous") {
            results = await fetch(`http://localhost:8000/gti525/v1/pointsdinteret?limite=10&page=${pageNumber}`);
          } else {
            filteredData = allData.filter((pointInteret) => pointInteret.type === filtreTypeLieu);
            results = await fetch(`http://localhost:8000/gti525/v1/pointsdinteret?limite=10&page=${pageNumber}&type=${filtreTypeLieu}`);
          }
        } else {
          filteredData = allData.filter((pointInteret) => pointInteret.Arrondissement === filtreArrondissement);
          if (filtreTypeLieu === "Tous") {
            results = await fetch(`http://localhost:8000/gti525/v1/pointsdinteret?limite=10&page=${pageNumber}&territoire=${filtreArrondissement}`);
          } else {
            filteredData = filteredData.filter((pointInteret) => pointInteret.type === filtreTypeLieu);
            results = await fetch(`http://localhost:8000/gti525/v1/pointsdinteret?limite=10&page=${pageNumber}&territoire=${filtreArrondissement}&type=${filtreTypeLieu}`);
          }
        }
        let data = await results.json();
        setPointsInteret(data);
        setNbPages(Math.ceil(filteredData.length / 10));
        // Fetching map data
        const mapResponse = await fetch("http://localhost:8000/gti525/v1/pointsdinteret/map");
        const mapData = await mapResponse.json();
        setMapData(mapData[0]);

      } catch (error) {
        console.error('Error fetching points of interest:', error);
      }
    };

    fetchPointsInteret();
  }, [filtreArrondissement, filtreTypeLieu, pageNumber, modifierPointInteret, isCarteOpen]);

  return (
    <>
      <div className="flex w-full h-full p-5">
        <div className="w-1/4 p-5">
          <PointsInteretInfos
            arrondissement={filtreArrondissement}
            mapData={mapData}
            lieux={nbrPointsInteret}
            filtreArrondissement={setFiltreArrondissement}
            filtreTypeLieu={setFiltreTypeLieu}
            setCurrentPage={setPageNumber}
          />
        </div>
        <div className="w-3/4 h-100 p-5 text-center">
          {(ajouterPointInteret || modifierPointInteret) ? (<AjouterPointInteretForm selectedID={selectedID} setModifierPointInteret={setModifierPointInteret} />) : (
            <>
              <TableauPointsInteret
                data={pointsInteret}
                pointsInteret={pointsInteret}
                selectedID={selectedID}
                setSelectedID={setSelectedID}
                setModifierPointInteret={setModifierPointInteret}
                setIsCarteOpen={setIsCarteOpen}
              />
              <PageSelector
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                nbPages={nbPages}
              />
            </>
          )}
        </div>
      </div>
      <CartePointInteret
        filtreArrondissement={filtreArrondissement}
        isCarteOpen={isCarteOpen}
        setIsCarteOpen={setIsCarteOpen}
        selectedID={selectedID}
      />
    </>
  );
};

export default PointsInteret;
