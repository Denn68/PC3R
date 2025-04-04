import { React } from "react";
import PointsInteretsTexte from "./PointsInteretsTexte";
import Territoires from "./Territoires";
import Arrondissements from "./Arrondissements";
import TypesLieu from "./TypesLieu";

const PointsInteretInfos = ({
  arrondissement,
  mapData,
  lieux,
  filtreArrondissement,
  filtreTypeLieu,
  setCurrentPage,
}) => {
  const handleFeatureClick = (name) => {
    filtreArrondissement(name);
    setCurrentPage(1);
  };

  return (
    <>
      <PointsInteretsTexte lieux={lieux} />
      <Territoires
        arrondissement={arrondissement}
        filtreArrondissement={filtreArrondissement}
        mapData={mapData}
        onFeatureClick={handleFeatureClick}
      />
      <Arrondissements
        selectedName={arrondissement}
        filtreArrondissement={filtreArrondissement}
      />
      <TypesLieu filtreTypeLieu={filtreTypeLieu} setCurrentPage={setCurrentPage}/>
      <div className="h-14"></div>
    </>
  );
};

export default PointsInteretInfos;
