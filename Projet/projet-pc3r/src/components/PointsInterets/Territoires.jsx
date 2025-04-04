import React, { useEffect } from "react";
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken =
  "pk.eyJ1IjoiYWJvdTEiLCJhIjoiY2xvZDh4YXl3MDAzdjJtcGZqZnY5OXI4aCJ9.1pfDuUpSM4KQ4iGFSKUzGw";

const Territoires = ({ arrondissement, mapData, onFeatureClick }) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-73.72, 45.546783],
      zoom: 8.5,
    });

    map.on("load", () => {
      map.addSource("MultiPolygon", {
        type: "geojson",
        data: mapData,
      });

      map.addLayer({
        id: "MultiPolygonFill",
        type: "fill",
        source: "MultiPolygon",
        paint: {
          "fill-color": "rgba(128, 128, 128, 0.5)", // Couleur de remplissage transparente
        },
        filter: ["==", "$type", "Polygon"], // Assurez-vous de ne cibler que les polygones
      });

      map.addLayer({
        id: "MultiPolygonLine",
        type: "line",
        source: "MultiPolygon",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-width": 2,
          "line-color": "black", // Couleur de la ligne de frontière
        },
      });

      // Fonction pour mettre à jour le style de remplissage en rouge
      if (arrondissement !== "Tous") {
        map.setPaintProperty("MultiPolygonFill", "fill-color", [
          "match",
          ["to-string", ["get", "NOM"]], // Convertissez en chaîne et comparez
          arrondissement,
          "red", // Si l'ID correspond à la feature cliquée, utilisez la couleur rouge
          "rgba(128, 128, 128, 0.5)", // Sinon, utilisez la couleur grise semi-transparente
        ]);
      }
    });

    map.on("click", "MultiPolygonFill", (e) => {
      const features = map.queryRenderedFeatures(e.point);
      const clickedFeatureId = e.features[0].properties.CODEID.toString();
      map.setPaintProperty("MultiPolygonFill", "fill-color", [
        "match",
        ["to-string", ["get", "CODEID"]], // Convertissez en chaîne et comparez
        clickedFeatureId,
        "red", // Si l'ID correspond à la feature cliquée, utilisez la couleur rouge
        "rgba(128, 128, 128, 0.5)", // Sinon, utilisez la couleur grise semi-transparente
      ]);

      //filtreArrondissement(features[1].properties.NOM);

      onFeatureClick(features[1].properties.NOM);
    });

    return () => {
      map.remove(); // Nettoie la carte lorsque le composant est démonté
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "300px" }}></div>
    </div>
  );
};

export default Territoires;
