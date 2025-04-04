import React from "react";

const PointsInteretsTexte = ({ lieux }) => {
  return (
    <>
      <h3 className="text-xl font-bold">Points d'intérêt</h3>
      <p className="text-base py-5">
        Le site propose {lieux} lieux d'intérêt qui pourraient être utiles aux
        amateurs de vélo
      </p>
    </>
  );
};

export default PointsInteretsTexte;
