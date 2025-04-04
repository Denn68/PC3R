import React from "react";
import StatistiquesInfos from "./StatistiquesInfos";
import TableauCompteurs from "./TableauCompteurs";
import { useEffect, useState } from "react";
import CarteCompteurs from "./CarteCompteurs";
import PageSelector from "./PageSelector";
import ChoixListeCarte from "./ChoixListeCarte";

export const Statistiques = () => {
  // List of all 'compteurs' from the API
  const [compteurs, setCompteurs] = useState([]);
  const [nbCompteurs, setNbCompteurs] = useState(0);

  // Pagination state
  const [pageNumber, setPageNumber] = useState(Number(1));
  const [nbPages, setNbPages] = useState([]);

  // Filter state by name
  const [filtreNomCompteurs, setFiltreNomCompteurs] = useState("");

  // Filter state by implantation (Date)
  const [implantation, setImplantation] = useState(Number(0));

  const [choixListeCarte, setChoixListeCarte] = useState(1); // 1 = Liste, 2 = Carte

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = `http://localhost:8000/gti525/v1/compteurs?limite=10&page=${pageNumber}`;
  
        if (implantation !== 0) {
          apiUrl += `&implantation=${implantation}`;
        }
  
        if (filtreNomCompteurs) {
          apiUrl += `&nom=${filtreNomCompteurs}`;
        }
  
        const response = await fetch(apiUrl);
        const data = await response.json();
  
        setNbPages(data.meta.totalPages);
        setPageNumber(data.meta.currentPage);
        setNbCompteurs(data.meta.totalCount);
        setCompteurs(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [filtreNomCompteurs, pageNumber, implantation]);
  

  return (
    <div className="flex w-full h-full p-5">
      <div className="w-1/4 p-5">
        <StatistiquesInfos
          nbCompteurs={nbCompteurs}
          setFiltreNomCompteurs={setFiltreNomCompteurs}
          setImplantation={setImplantation}
          setPageNumber={setPageNumber}
          implantation={implantation}
        />
      </div>
      <div className="w-3/4 h-100 p-5 text-center">
        <ChoixListeCarte
          choixListeCarte={choixListeCarte}
          setChoixListeCarte={setChoixListeCarte}
        />

        {choixListeCarte === 1 ? (
          <div>
            <TableauCompteurs
              compteurs={compteurs}
              setCompteurs={setCompteurs}
            />
            <PageSelector
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              nbPages={nbPages}
              setNbPages={setNbPages}
            />
          </div>
        ) : choixListeCarte === 2 ? (
          <CarteCompteurs implantation={implantation} filtreNomCompteurs={filtreNomCompteurs} />
        ) : null}
      </div>
    </div>
  );
};

export default Statistiques;
